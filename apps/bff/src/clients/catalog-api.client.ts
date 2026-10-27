import type { AddCartItemDto, ApiEnvelope, CartDto, ProductDto } from '@acme/contracts';
import { BffError } from '../http/errors.ts';
import { isIncident, isRetryableStatus, translateUpstreamFailure } from './upstream-errors.ts';

export type FetchFn = (input: string, init?: RequestInit) => Promise<Response>;

type Method = 'GET' | 'POST' | 'DELETE';

export type RetryOptions = {
  attempts: number;    // extra attempts after the first one, GET only
  baseDelayMs: number; // exponential backoff: base, 2x base, 4x base… plus jitter
  budgetMs: number;    // never start a retry past this total elapsed time
};

const DEFAULT_RETRY: RetryOptions = { attempts: 2, baseDelayMs: 100, budgetMs: 5000 };

type ClientOptions = {
  baseUrl: string;
  timeoutMs: number; // per attempt
  requestId: string;
  fetch?: FetchFn;
  retry?: Partial<RetryOptions>;
};

type Attempt<T> = { ok: true; data: T } | { ok: false; retryable: boolean; error: BffError };

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * HTTP client to the API, created for each incoming request.
 * - propagates X-Request-Id so BFF and API logs can be correlated
 * - aborts each attempt after `timeoutMs`
 * - retries GETs on transient failures (network, timeout, 502/503/504) with backoff;
 *   POST/DELETE are never retried because they are not idempotent here
 * - translates API failures into browser-safe errors (see upstream-errors.ts)
 */
export class CatalogApiClient {
  private readonly fetchFn: FetchFn;
  private readonly retry: RetryOptions;

  constructor(private readonly options: ClientOptions) {
    this.fetchFn = options.fetch ?? fetch;
    this.retry = { ...DEFAULT_RETRY, ...options.retry };
  }

  listProducts(tenantId: string, filters: { search?: string; category?: string }) {
    const query = new URLSearchParams({ pageSize: '50' });
    if (filters.search) query.set('search', filters.search);
    if (filters.category) query.set('category', filters.category);
    return this.request<ProductDto[]>('GET', `/tenants/${tenantId}/products?${query}`);
  }

  getProduct(tenantId: string, productId: string) {
    return this.request<ProductDto>('GET', `/tenants/${tenantId}/products/${encodeURIComponent(productId)}`);
  }

  listCategories(tenantId: string) {
    return this.request<string[]>('GET', `/tenants/${tenantId}/categories`);
  }

  createCart(tenantId: string) {
    return this.request<CartDto>('POST', `/tenants/${tenantId}/carts`);
  }

  getCart(tenantId: string, cartId: string) {
    return this.request<CartDto>('GET', `/tenants/${tenantId}/carts/${cartId}`);
  }

  addItem(tenantId: string, cartId: string, item: AddCartItemDto) {
    return this.request<CartDto>('POST', `/tenants/${tenantId}/carts/${cartId}/items`, item);
  }

  // lineId is `${productId}:${finishId}`.
  removeItem(tenantId: string, cartId: string, lineId: string) {
    return this.request<CartDto>('DELETE', `/tenants/${tenantId}/carts/${cartId}/items/${encodeURIComponent(lineId)}`);
  }

  clearCart(tenantId: string, cartId: string) {
    return this.request<CartDto>('DELETE', `/tenants/${tenantId}/carts/${cartId}/items`);
  }

  async health(): Promise<boolean> {
    try {
      const response = await this.fetchFn(`${this.options.baseUrl}/health`, { signal: AbortSignal.timeout(1000) });
      return response.ok;
    } catch {
      return false;
    }
  }

  private async request<T>(method: Method, path: string, body?: unknown): Promise<T> {
    const maxRetries = method === 'GET' ? this.retry.attempts : 0;
    const startedAt = Date.now();

    for (let retry = 0; ; retry++) {
      const result = await this.attempt<T>(method, path, body);
      if (result.ok) return result.data;

      const delay = this.retry.baseDelayMs * 2 ** retry + Math.random() * this.retry.baseDelayMs;
      const withinBudget = Date.now() - startedAt + delay < this.retry.budgetMs;
      if (!result.retryable || retry >= maxRetries || !withinBudget) throw result.error;

      this.log(`retrying ${method} ${path} in ${Math.round(delay)}ms (${retry + 1}/${maxRetries})`);
      await sleep(delay);
    }
  }

  private async attempt<T>(method: Method, path: string, body?: unknown): Promise<Attempt<T>> {
    let response: Response;
    try {
      response = await this.fetchFn(`${this.options.baseUrl}/api/v1${path}`, {
        method,
        headers: {
          Accept: 'application/json',
          'X-Request-Id': this.options.requestId,
          ...(body !== undefined && { 'Content-Type': 'application/json' }),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(this.options.timeoutMs),
      });
    } catch (error) {
      const timedOut = error instanceof Error && error.name === 'TimeoutError';
      this.log(`${method} ${path} ${timedOut ? 'timed out' : 'unreachable'}`, error);
      return {
        ok: false,
        retryable: true,
        error: timedOut
          ? new BffError(504, 'UPSTREAM_TIMEOUT', 'Le service catalogue met trop de temps à répondre')
          : new BffError(503, 'UPSTREAM_UNAVAILABLE', 'Le service catalogue ne répond pas, réessaie dans un instant'),
      };
    }

    const envelope = await response.json().catch(() => null) as ApiEnvelope<T> | null;
    const wellFormed = envelope !== null && typeof envelope.success === 'boolean';

    if (wellFormed && envelope.success) return { ok: true, data: envelope.data };

    // A 2xx with an unreadable body is an API bug; a non-2xx without an envelope usually comes
    // from a proxy or load balancer in front of the API (HTML 502 page, etc.).
    if (response.ok) {
      this.log(`${method} ${path} -> ${response.status} with an unreadable body`);
      return { ok: false, retryable: false, error: new BffError(502, 'UPSTREAM_INVALID_RESPONSE', 'Réponse inattendue du service catalogue') };
    }

    const failure = {
      status: response.status,
      error: wellFormed && !envelope.success ? envelope.error : null,
      retryAfter: response.headers.get('Retry-After'),
    };
    if (isIncident(failure)) this.log(`${method} ${path} -> ${response.status} ${failure.error?.code ?? '(no envelope)'}`);

    return { ok: false, retryable: isRetryableStatus(response.status), error: translateUpstreamFailure(failure) };
  }

  private log(message: string, error?: unknown) {
    console.error(`[${this.options.requestId}] API ${message}`, ...(error === undefined ? [] : [error]));
  }
}
