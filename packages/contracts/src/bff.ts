// BFF -> frontends contract: views shaped for the screen (prices already formatted, availability computed).
import type { FinishDto, FormFactor } from './api.ts';

export type { FinishDto as FinishView };

export type PriceView = { amountCents: number; currency: string; formatted: string };

export type CategoryView = { name: string; slug: string };

export type CatalogProductView = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: CategoryView;
  formFactor: FormFactor;
  finishes: FinishDto[];
  highlights: string[];
  isNew: boolean;
  price: PriceView;
  available: boolean;
  lowStock: boolean;
};

export type CatalogPageView = {
  products: CatalogProductView[];
  categories: CategoryView[];
  // Set when the page was filtered by a category slug.
  category?: CategoryView;
};

export type ProductPageView = {
  product: CatalogProductView;
  // Other products of the same category, for the "related" shelf.
  related: CatalogProductView[];
};

export type CartLineView = {
  lineId: string;
  productId: string;
  name: string;
  formFactor: FormFactor;
  finish: FinishDto;
  quantity: number;
  unitPrice: PriceView;
  lineTotal: PriceView;
};

export type CartView = {
  lines: CartLineView[];
  itemCount: number;
  total: PriceView;
};
