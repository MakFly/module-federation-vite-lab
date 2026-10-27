import type { ApiErrorDetail } from '@acme/contracts';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

// Error that is safe to show to the browser: status, stable code and a user-readable message.
export class BffError extends Error {
  constructor(
    readonly status: ContentfulStatusCode,
    readonly code: string,
    message: string,
    readonly details?: ApiErrorDetail[],
    // Seconds, sent back as the Retry-After header (429 / 503).
    readonly retryAfter?: string,
  ) {
    super(message);
    this.name = 'BffError';
  }
}
