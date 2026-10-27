declare module 'catalog/CatalogPage' {
  import type { ComponentType } from 'react';
  import type { CatalogPageProps } from '@acme/contracts';

  const CatalogPage: ComponentType<CatalogPageProps>;
  export default CatalogPage;
}

declare module 'catalog/ProductPage' {
  import type { ComponentType } from 'react';
  import type { ProductPageProps } from '@acme/contracts';

  const ProductPage: ComponentType<ProductPageProps>;
  export default ProductPage;
}
