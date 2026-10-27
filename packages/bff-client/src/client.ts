import type { ApiEnvelope, ApiErrorDetail } from '@acme/contracts';

// Browser-side error: keeps the BFF's stable code so callers can react precisely (e.g. PRODUCT_UNAVAILABLE).
export class BffRequestError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: ApiErrorDetail[],
    readonly requestId?: string,
  ) {
    super(message);
    this.name = 'BffRequestError';
  }
}

type Method = 'GET' | 'POST' | 'DELETE';

// Relative paths: in dev the Vite proxy redirects /bff to the BFF, in prod a reverse proxy does.
// A remote loaded in the shell therefore resolves /bff against the shell's origin.
async function request<T>(method: Method, path: string, body?: unknown, signal?: AbortSignal): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/bff${path}`, {
      method,
      credentials: 'same-origin',
      headers: { Accept: 'application/json', ...(body !== undefined && { 'Content-Type': 'application/json' }) },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new BffRequestError(0, 'NETWORK_ERROR', 'Connexion au serveur impossible');
  }

  const envelope = await response.json().catch(() => null) as ApiEnvelope<T> | null;
  if (!envelope) throw new BffRequestError(response.status, 'INVALID_RESPONSE', `Réponse inattendue (${response.status})`);
  if (!envelope.success) {
    const { code, message, details } = envelope.error;
    throw new BffRequestError(response.status, code, message, details, envelope.meta.requestId);
  }
  return envelope.data;
}

export const bff = {
  get: <T>(path: string, signal?: AbortSignal) => request<T>('GET', path, undefined, signal),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
};

export const isAbort = (error: unknown) => error instanceof DOMException && error.name === 'AbortError';
