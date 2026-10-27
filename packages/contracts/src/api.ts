// API -> BFF contract: what the API publishes. The browser never sees it.

export type MoneyDto = { amountCents: number; currency: 'EUR' };

// The device's physical shape: product truth, used by the frontends to draw its illustration.
export type FormFactor = 'laptop' | 'phone' | 'earbuds' | 'headphones' | 'display' | 'stylus' | 'dock';

export type FinishDto = { id: string; name: string; hex: string };

export type ProductDto = {
  id: string;
  tenantId: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  formFactor: FormFactor;
  finishes: FinishDto[];
  highlights: string[];
  isNew: boolean;
  price: MoneyDto;
  stock: number;
};

export type CartLineDto = {
  // One line per product and finish: `${productId}:${finishId}`.
  lineId: string;
  productId: string;
  name: string;
  formFactor: FormFactor;
  finish: FinishDto;
  quantity: number;
  unitPrice: MoneyDto;
  lineTotal: MoneyDto;
};

export type CartDto = {
  id: string;
  tenantId: string;
  lines: CartLineDto[];
  itemCount: number;
  total: MoneyDto;
};

export type AddCartItemDto = { productId: string; finishId: string; quantity: number };
