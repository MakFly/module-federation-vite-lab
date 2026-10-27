import type { Finish, FormFactor } from '../../../shared/domain/finish.ts';
import type { Money } from '../../../shared/domain/money.ts';

// What the cart needs to know about a product, in its own vocabulary.
// The "cart" context does not depend on the Product entity of the "catalog" context.
export type ProductSnapshot = {
  id: string;
  name: string;
  formFactor: FormFactor;
  finishes: Finish[];
  price: Money;
  stock: number;
};
