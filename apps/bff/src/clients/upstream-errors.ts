import type { ApiErrorBody } from '@acme/contracts';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { BffError } from '../http/errors.ts';

/**
 * How an API failure is turned into what the browser sees.
 *
 * | API status        | Browser gets               | Why                                                        |
 * |-------------------|----------------------------|------------------------------------------------------------|
 * | 400 404 409 422   | same status, same code     | meaningful to the user (validation, not found, rule)       |
 * | 401 403           | 502 UPSTREAM_AUTH_FAILED   | BFF -> API credentials problem, not the user's session     |
 * | 429               | 503 UPSTREAM_BUSY + Retry-After | the BFF was throttled, not the browser                |
 * | other 4xx         | 502 UPSTREAM_CONTRACT_ERROR| BFF and API disagree on the contract: a bug on our side    |
 * | 503 504           | 503 UPSTREAM_UNAVAILABLE   | transient, worth retrying later                            |
 * | other 5xx         | 502 UPSTREAM_ERROR         | details stay in the logs                                   |
 * | network / timeout | 503 / 504                  | see CatalogApiClient                                       |
 */
const RELAYED_STATUSES = new Set([400, 404, 409, 422]);

export type UpstreamFailure = {
  status: number;
  error: ApiErrorBody | null;
  retryAfter: string | null;
};

// Whether the BFF itself should log the failure: relayed 4xx are normal traffic, everything else is an incident.
export const isIncident = ({ status, error }: UpstreamFailure) => !(error && RELAYED_STATUSES.has(status));

export function translateUpstreamFailure({ status, error, retryAfter }: UpstreamFailure): BffError {
  if (error && RELAYED_STATUSES.has(status)) {
    return new BffError(status as ContentfulStatusCode, error.code, error.message, error.details);
  }
  if (status === 401 || status === 403) {
    return new BffError(502, 'UPSTREAM_AUTH_FAILED', 'Le service catalogue est indisponible pour le moment');
  }
  if (status === 429) {
    return new BffError(503, 'UPSTREAM_BUSY', 'Le service catalogue est surchargé, réessaie dans un instant', undefined, retryAfter ?? '1');
  }
  if (status < 500) {
    return new BffError(502, 'UPSTREAM_CONTRACT_ERROR', 'Le service catalogue a refusé la requête');
  }
  if (status === 503 || status === 504) {
    return new BffError(503, 'UPSTREAM_UNAVAILABLE', 'Le service catalogue ne répond pas, réessaie dans un instant', undefined, retryAfter ?? undefined);
  }
  return new BffError(502, 'UPSTREAM_ERROR', 'Le service catalogue a rencontré une erreur');
}

// Transient failures a GET can safely be retried on. 429 is excluded on purpose: we respect back-pressure.
export const isRetryableStatus = (status: number) => status === 502 || status === 503 || status === 504;
