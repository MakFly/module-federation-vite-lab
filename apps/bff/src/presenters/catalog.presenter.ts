import type { CatalogPageView, CatalogProductView, CategoryView, ProductDto, ProductPageView } from '@acme/contracts';
import { presentPrice } from './price.ts';

const LOW_STOCK_THRESHOLD = 3;
const MAX_RELATED = 4;

// URL-friendly category id: "Téléphones" -> "telephones", "Écrans" -> "ecrans".
export const slugify = (name: string) =>
  name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-');

export const presentCategory = (name: string): CategoryView => ({ name, slug: slugify(name) });

// The exact stock is internal data: the frontend only receives what the screen needs.
export const presentProduct = (product: ProductDto): CatalogProductView => ({
  id: product.id,
  name: product.name,
  tagline: product.tagline,
  description: product.description,
  category: presentCategory(product.category),
  formFactor: product.formFactor,
  finishes: product.finishes.map(({ id, name, hex }) => ({ id, name, hex })),
  highlights: [...product.highlights],
  isNew: product.isNew,
  price: presentPrice(product.price),
  available: product.stock > 0,
  lowStock: product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD,
});

export const presentCatalogPage = (products: ProductDto[], categories: CategoryView[], category?: CategoryView): CatalogPageView => ({
  products: products.map(presentProduct),
  categories,
  ...(category && { category }),
});

// "Related" shelf: other products of the same category, in catalog order.
export const presentProductPage = (product: ProductDto, catalog: ProductDto[]): ProductPageView => ({
  product: presentProduct(product),
  related: catalog
    .filter((candidate) => candidate.category === product.category && candidate.id !== product.id)
    .slice(0, MAX_RELATED)
    .map(presentProduct),
});
