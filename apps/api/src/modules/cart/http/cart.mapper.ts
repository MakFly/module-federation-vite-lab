import type { CartDto } from '@acme/contracts';
import type { Cart } from '../domain/cart.ts';

export const toCartDto = (cart: Cart): CartDto => ({
  id: cart.id,
  tenantId: cart.tenantId,
  lines: cart.lines.map((line) => ({
    lineId: line.lineId,
    productId: line.productId,
    name: line.name,
    formFactor: line.formFactor,
    finish: { ...line.finish },
    quantity: line.quantity,
    unitPrice: line.unitPrice.toJSON(),
    lineTotal: line.lineTotal().toJSON(),
  })),
  itemCount: cart.itemCount(),
  total: cart.total().toJSON(),
});
