import { AddItemToCart, ClearCart, CreateCart, GetCart, RemoveCartItem } from './modules/cart/application/cart.use-cases.ts';
import type { CartUseCases } from './modules/cart/http/cart.routes.ts';
import { InProcessCatalogAdapter } from './modules/cart/infrastructure/catalog.adapter.ts';
import { InMemoryCartRepository } from './modules/cart/infrastructure/in-memory-cart.repository.ts';
import { GetProduct } from './modules/catalog/application/get-product.ts';
import { ListCategories } from './modules/catalog/application/list-categories.ts';
import { ListProducts } from './modules/catalog/application/list-products.ts';
import type { CatalogUseCases } from './modules/catalog/http/catalog.routes.ts';
import { InMemoryProductRepository } from './modules/catalog/infrastructure/in-memory-product.repository.ts';
import { seedProducts } from './modules/catalog/infrastructure/seed.ts';

export type Container = { catalog: CatalogUseCases; cart: CartUseCases };

// Composition root: the only place that picks the concrete implementations.
// Plugging in a database or a legacy system = changing one line here.
export function createContainer(): Container {
  const products = new InMemoryProductRepository(seedProducts());
  const carts = new InMemoryCartRepository();
  const catalogPort = new InProcessCatalogAdapter(products);

  return {
    catalog: {
      listProducts: new ListProducts(products),
      getProduct: new GetProduct(products),
      listCategories: new ListCategories(products),
    },
    cart: {
      createCart: new CreateCart(carts, catalogPort),
      getCart: new GetCart(carts),
      addItem: new AddItemToCart(carts, catalogPort),
      removeItem: new RemoveCartItem(carts),
      clearCart: new ClearCart(carts),
    },
  };
}
