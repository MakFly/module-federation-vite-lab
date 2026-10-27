import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from 'bun:test';
import { BffError } from '../http/errors.ts';
import { CatalogApiClient } from './catalog-api.client.ts';

const meta = { requestId: 'up', timestamp: '2026-01-01T00:00:00.000Z' };
const json = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...headers } });

const ok = (data: unknown) => () => json(200, { success: true, data, meta });
const fail = (status: number, code: string, headers?: Record<string, string>) => () =>
  json(status, { success: false, error: { code, message: `upstream says ${code}`, details: [{ field: 'x', message: 'y' }] }, meta }, headers);
const raw = (status: number, body: string) => () => new Response(body, { status, headers: { 'Content-Type': 'text/html' } });
const timeout = () => () => { throw new DOMException('The operation timed out.', 'TimeoutError'); };

// Each step answers one call; the last step repeats if the client calls more often.
const clientWith = (...steps: (() => Response)[]) => {
  const fetch = mock(async () => steps[Math.min(fetch.mock.calls.length - 1, steps.length - 1)]!());
  const client = new CatalogApiClient({ baseUrl: 'http://api', timeoutMs: 50, requestId: 'rid', fetch, retry: { baseDelayMs: 0 } });
  return { client, calls: () => fetch.mock.calls.length };
};

const failureOf = async (promise: Promise<unknown>) => {
  try {
    await promise;
  } catch (error) {
    if (error instanceof BffError) return error;
    throw error;
  }
  throw new Error('expected the call to fail');
};

let silence: ReturnType<typeof spyOn>;
beforeEach(() => { silence = spyOn(console, 'error').mockImplementation(() => {}); });
afterEach(() => silence.mockRestore());

describe('CatalogApiClient : traduction des erreurs amont', () => {
  test('relaie un 422 métier avec son code et ses détails, sans réessayer', async () => {
    const { client, calls } = clientWith(fail(422, 'INSUFFICIENT_STOCK'));
    const error = await failureOf(client.listCategories('fr'));

    expect(error.status).toBe(422);
    expect(error.code).toBe('INSUFFICIENT_STOCK');
    expect(error.details).toEqual([{ field: 'x', message: 'y' }]);
    expect(calls()).toBe(1);
    expect(silence).not.toHaveBeenCalled(); // normal traffic, not an incident
  });

  test('401 de l\'API -> 502, jamais un 401 qui ferait croire à une déconnexion', async () => {
    const error = await failureOf(clientWith(fail(401, 'TOKEN_EXPIRED')).client.listCategories('fr'));
    expect(error.status).toBe(502);
    expect(error.code).toBe('UPSTREAM_AUTH_FAILED');
    expect(error.message).not.toContain('upstream');
  });

  test('429 -> 503 avec Retry-After, sans réessayer (on respecte la contre-pression)', async () => {
    const { client, calls } = clientWith(fail(429, 'RATE_LIMITED', { 'Retry-After': '7' }));
    const error = await failureOf(client.listCategories('fr'));

    expect(error.status).toBe(503);
    expect(error.code).toBe('UPSTREAM_BUSY');
    expect(error.retryAfter).toBe('7');
    expect(calls()).toBe(1);
  });

  test('autre 4xx (405) -> 502 UPSTREAM_CONTRACT_ERROR, loggé comme incident', async () => {
    const error = await failureOf(clientWith(fail(405, 'METHOD_NOT_ALLOWED')).client.listCategories('fr'));
    expect(error.status).toBe(502);
    expect(error.code).toBe('UPSTREAM_CONTRACT_ERROR');
    expect(silence).toHaveBeenCalled();
  });

  test('500 -> 502 UPSTREAM_ERROR, message amont masqué, pas de retry (bug, pas un incident passager)', async () => {
    const { client, calls } = clientWith(fail(500, 'INTERNAL_ERROR'));
    const error = await failureOf(client.listCategories('fr'));

    expect(error.status).toBe(502);
    expect(error.code).toBe('UPSTREAM_ERROR');
    expect(error.message).not.toContain('upstream');
    expect(calls()).toBe(1);
  });

  test('200 avec un corps illisible -> 502 UPSTREAM_INVALID_RESPONSE', async () => {
    const error = await failureOf(clientWith(raw(200, 'not json')).client.listCategories('fr'));
    expect(error.code).toBe('UPSTREAM_INVALID_RESPONSE');
  });
});

describe('CatalogApiClient : retries', () => {
  test('un GET réussit après deux 503 passagers', async () => {
    const { client, calls } = clientWith(fail(503, 'UNAVAILABLE'), fail(503, 'UNAVAILABLE'), ok(['Audio']));
    expect(await client.listCategories('fr')).toEqual(['Audio']);
    expect(calls()).toBe(3);
  });

  test('un GET abandonne après les retries -> 503 UPSTREAM_UNAVAILABLE', async () => {
    const { client, calls } = clientWith(fail(503, 'UNAVAILABLE'));
    const error = await failureOf(client.listCategories('fr'));

    expect(error.code).toBe('UPSTREAM_UNAVAILABLE');
    expect(calls()).toBe(3);
  });

  test('page 502 HTML d\'un proxy : réessayée puis 502 UPSTREAM_ERROR', async () => {
    const { client, calls } = clientWith(raw(502, '<h1>Bad Gateway</h1>'));
    const error = await failureOf(client.listCategories('fr'));

    expect(error.status).toBe(502);
    expect(calls()).toBe(3);
  });

  test('timeout -> 504 UPSTREAM_TIMEOUT après les retries', async () => {
    const { client, calls } = clientWith(timeout());
    const error = await failureOf(client.listCategories('fr'));

    expect(error.status).toBe(504);
    expect(error.code).toBe('UPSTREAM_TIMEOUT');
    expect(calls()).toBe(3);
  });

  test('un POST n\'est jamais réessayé (non idempotent)', async () => {
    const { client, calls } = clientWith(fail(503, 'UNAVAILABLE'));
    await failureOf(client.addItem('fr', 'cart-1', { productId: 'galet', finishId: 'lin', quantity: 1 }));
    expect(calls()).toBe(1);
  });

  test('pas de retry au-delà du budget de temps', async () => {
    const fetch = mock(async () => fail(503, 'UNAVAILABLE')());
    const client = new CatalogApiClient({ baseUrl: 'http://api', timeoutMs: 50, requestId: 'rid', fetch, retry: { baseDelayMs: 1000, budgetMs: 500 } });
    await failureOf(client.listCategories('fr'));
    expect(fetch.mock.calls.length).toBe(1);
  });
});

describe('CatalogApiClient : routes amont', () => {
  const recording = () => {
    const urls: string[] = [];
    const methods: string[] = [];
    const fetch = mock(async (input: string, init?: RequestInit) => {
      urls.push(input);
      methods.push(init?.method ?? 'GET');
      return ok({})();
    });
    const client = new CatalogApiClient({ baseUrl: 'http://api', timeoutMs: 50, requestId: 'rid', fetch, retry: { baseDelayMs: 0 } });
    return { client, urls, methods };
  };

  test('getProduct appelle la fiche produit de l\'organisation', async () => {
    const { client, urls } = recording();
    await client.getProduct('fr', 'ardoise-14');
    expect(urls).toEqual(['http://api/api/v1/tenants/fr/products/ardoise-14']);
  });

  test('removeItem cible la ligne produit + finition', async () => {
    const { client, urls, methods } = recording();
    await client.removeItem('fr', 'cart-1', 'galet:lin');
    expect(urls).toEqual(['http://api/api/v1/tenants/fr/carts/cart-1/items/galet%3Alin']);
    expect(methods).toEqual(['DELETE']);
  });
});
