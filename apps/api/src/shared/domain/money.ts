import { BusinessRuleViolation, ValidationError } from './errors.ts';

export type Currency = 'EUR';

// Value object: immutable, compared by value, always in cents to avoid floats.
export class Money {
  private constructor(
    readonly amountCents: number,
    readonly currency: Currency,
  ) {}

  static of(amountCents: number, currency: Currency = 'EUR'): Money {
    if (!Number.isSafeInteger(amountCents) || amountCents < 0) {
      throw new ValidationError('INVALID_MONEY', `Montant invalide : ${amountCents}`);
    }
    return new Money(amountCents, currency);
  }

  static zero(currency: Currency = 'EUR'): Money {
    return new Money(0, currency);
  }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amountCents + other.amountCents, this.currency);
  }

  multiply(factor: number): Money {
    return Money.of(this.amountCents * factor, this.currency);
  }

  equals(other: Money): boolean {
    return this.amountCents === other.amountCents && this.currency === other.currency;
  }

  toJSON() {
    return { amountCents: this.amountCents, currency: this.currency };
  }

  private assertSameCurrency(other: Money) {
    if (other.currency !== this.currency) {
      throw new BusinessRuleViolation('CURRENCY_MISMATCH', `Impossible d'additionner ${this.currency} et ${other.currency}`);
    }
  }
}
