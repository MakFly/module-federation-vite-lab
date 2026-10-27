import type { CatalogProductView } from './bff.ts';

export type * from './http.ts';
export type * from './api.ts';
export type * from './bff.ts';

// What a remote reports when the visitor asks to add a product in a given finish.
export type AddToBagRequest = { product: CatalogProductView; finishId: string };

// Shell -> catalog remote contracts (Module Federation, two exposed modules).
// Remotes render plain links (see `paths` in @acme/bff-client); the shell owns routing.
export type CatalogPageProps = {
  tenantId: string;
  categorySlug?: string;
  onAddToBag: (request: AddToBagRequest) => void;
};

export type ProductPageProps = {
  tenantId: string;
  productId: string;
  onAddToBag: (request: AddToBagRequest) => void;
};
