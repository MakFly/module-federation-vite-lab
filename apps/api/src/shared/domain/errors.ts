export type DomainErrorKind = 'validation' | 'not_found' | 'conflict' | 'business_rule';

export type ErrorDetail = { field: string; message: string };

// Error thrown by the domain or a use case. It knows nothing about HTTP:
// translation to a status happens in the interface layer (shared/http/errorHandler.ts).
export abstract class DomainError extends Error {
  abstract readonly kind: DomainErrorKind;

  constructor(
    readonly code: string,
    message: string,
    readonly details?: ErrorDetail[],
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class ValidationError extends DomainError {
  readonly kind = 'validation' as const;
}

export class NotFoundError extends DomainError {
  readonly kind = 'not_found' as const;
}

export class ConflictError extends DomainError {
  readonly kind = 'conflict' as const;
}

// A business rule rejects the operation even though the request is well-formed.
export class BusinessRuleViolation extends DomainError {
  readonly kind = 'business_rule' as const;
}
