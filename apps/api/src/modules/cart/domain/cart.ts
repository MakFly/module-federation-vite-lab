import { BusinessRuleViolation, NotFoundError, ValidationError } from '../../../shared/domain/errors.ts';
import type { Finish, FormFactor } from '../../../shared/domain/finish.ts';
import { Money } from '../../../shared/domain/money.ts';
import type { ProductSnapshot } from './product-snapshot.ts';

export const MAX_QUANTITY_PER_LINE = 5;
export const MAX_LINES = 20;

// A line is one product in one finish: two finishes of the same product make two lines.
export const lineIdOf = (productId: string, finishId: string) => `${productId}:${finishId}`;

export class CartLine {
  constructor(
    readonly productId: string,
    readonly name: string,
    readonly formFactor: FormFactor,
    readonly finish: Finish,
    readonly unitPrice: Money,
    readonly quantity: number,
  ) {}

  get lineId(): string {
    return lineIdOf(this.productId, this.finish.id);
  }

  lineTotal(): Money {
    return this.unitPrice.multiply(this.quantity);
  }

  withQuantity(quantity: number): CartLine {
    return new CartLine(this.productId, this.name, this.formFactor, this.finish, this.unitPrice, quantity);
  }
}

// "Flat" shape used by persistence: the repository never handles the aggregate's internals.
export type CartSnapshot = {
  id: string;
  tenantId: string;
  lines: {
    productId: string;
    name: string;
    formFactor: FormFactor;
    finish: Finish;
    unitPriceCents: number;
    quantity: number;
  }[];
};

/**
 * Cart aggregate: every modification goes through its methods, which guarantee the invariants.
 * - one line per product and finish, the finish must be one the product is sold in
 * - integer quantity >= 1
 * - at most MAX_QUANTITY_PER_LINE per line and MAX_LINES lines
 * - never more than the available stock, all finishes of a product combined
 * - the price is frozen at first add of a line (a price change does not alter an existing line)
 */
export class Cart {
  private constructor(
    readonly id: string,
    readonly tenantId: string,
    private readonly linesById: Map<string, CartLine>,
  ) {}

  static create(id: string, tenantId: string): Cart {
    return new Cart(id, tenantId, new Map());
  }

  static restore(snapshot: CartSnapshot): Cart {
    const lines = snapshot.lines.map((line) =>
      new CartLine(line.productId, line.name, line.formFactor, { ...line.finish }, Money.of(line.unitPriceCents), line.quantity));
    return new Cart(snapshot.id, snapshot.tenantId, new Map(lines.map((line) => [line.lineId, line])));
  }

  get lines(): readonly CartLine[] {
    return [...this.linesById.values()];
  }

  addItem(product: ProductSnapshot, finishId: string, quantity: number): void {
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new ValidationError('INVALID_QUANTITY', 'La quantité doit être un entier positif');
    }
    const finish = product.finishes.find((candidate) => candidate.id === finishId);
    if (!finish) {
      throw new ValidationError('INVALID_FINISH', `« ${product.name} » n'existe pas dans la finition « ${finishId} »`);
    }
    if (product.stock === 0) {
      throw new BusinessRuleViolation('PRODUCT_UNAVAILABLE', `« ${product.name} » est en rupture de stock`);
    }

    const lineId = lineIdOf(product.id, finish.id);
    const existing = this.linesById.get(lineId);
    if (!existing && this.linesById.size >= MAX_LINES) {
      throw new BusinessRuleViolation('CART_FULL', `Un panier contient au plus ${MAX_LINES} articles différents`);
    }

    const nextQuantity = (existing?.quantity ?? 0) + quantity;
    if (nextQuantity > MAX_QUANTITY_PER_LINE) {
      throw new BusinessRuleViolation(
        'MAX_QUANTITY_EXCEEDED',
        `Maximum ${MAX_QUANTITY_PER_LINE} « ${product.name} » ${finish.name} par panier`,
      );
    }
    // Stock is per product, not per finish: every line of this product counts.
    if (this.quantityOf(product.id) + quantity > product.stock) {
      throw new BusinessRuleViolation('INSUFFICIENT_STOCK', `Plus que ${product.stock} « ${product.name} » en stock`);
    }

    this.linesById.set(
      lineId,
      existing
        ? existing.withQuantity(nextQuantity)
        : new CartLine(product.id, product.name, product.formFactor, { ...finish }, product.price, nextQuantity),
    );
  }

  removeItem(lineId: string): void {
    if (!this.linesById.delete(lineId)) {
      throw new NotFoundError('CART_LINE_NOT_FOUND', `L'article « ${lineId} » n'est pas dans le panier`);
    }
  }

  clear(): void {
    this.linesById.clear();
  }

  itemCount(): number {
    return this.lines.reduce((count, line) => count + line.quantity, 0);
  }

  total(): Money {
    return this.lines.reduce((sum, line) => sum.add(line.lineTotal()), Money.zero());
  }

  toSnapshot(): CartSnapshot {
    return {
      id: this.id,
      tenantId: this.tenantId,
      lines: this.lines.map((line) => ({
        productId: line.productId,
        name: line.name,
        formFactor: line.formFactor,
        finish: { ...line.finish },
        unitPriceCents: line.unitPrice.amountCents,
        quantity: line.quantity,
      })),
    };
  }

  private quantityOf(productId: string): number {
    return this.lines.filter((line) => line.productId === productId).reduce((count, line) => count + line.quantity, 0);
  }
}
