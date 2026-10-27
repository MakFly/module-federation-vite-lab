import type { CartDto, CartView } from '@acme/contracts';
import { presentPrice } from './price.ts';

export const presentCart = (cart: CartDto): CartView => ({
  lines: cart.lines.map((line) => ({
    lineId: line.lineId,
    productId: line.productId,
    name: line.name,
    formFactor: line.formFactor,
    finish: { id: line.finish.id, name: line.finish.name, hex: line.finish.hex },
    quantity: line.quantity,
    unitPrice: presentPrice(line.unitPrice),
    lineTotal: presentPrice(line.lineTotal),
  })),
  itemCount: cart.itemCount,
  total: presentPrice(cart.total),
});

export const emptyCartView = (): CartView => ({
  lines: [],
  itemCount: 0,
  total: presentPrice({ amountCents: 0, currency: 'EUR' }),
});
