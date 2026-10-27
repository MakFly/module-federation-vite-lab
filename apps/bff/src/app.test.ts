import { describe, expect, test } from 'bun:test';
import type { ApiFailure, ApiSuccess, CartView, CatalogPageView, ProductPageView } from '@acme/contracts';
// Integration test: the BFF talks to the real API app, in memory, no network.
import { createApp as createApiApp } from '../../api/src/app.ts';
import { createApp } from './app.ts';
import type { Config } from './config.ts';

const config: Config = {
  port: 0,
  apiUrl: 'http://api.internal',
  apiTimeoutMs: 1000,
  allowedOrigins: ['http://localhost:3000'],
  secureCookies: false,
};

const setup = () => {
  const api = createApiApp();
  const seenRequestIds: string[] = [];
  const bff = createApp({
    config,
    fetch: async (input, init) => {
      seenRequestIds.push(new Headers(init?.headers).get('X-Request-Id') ?? '');
      return api.request(input, init);
    },
  });

  // Tiny browser: replays the session cookie it received.
  let cookie = '';
  const call = async (path: string, init: RequestInit = {}) => {
    const res = await bff.request(path, { ...init, headers: { ...init.headers, ...(cookie && { Cookie: cookie }) } });
    const setCookie = res.headers.get('Set-Cookie');
    if (setCookie) cookie = setCookie.split(';')[0]!;
    return res;
  };
  const post = (path: string, body: unknown) =>
    call(path, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:3000' }, body: JSON.stringify(body) });
  const getCart = async (tenant = 'fr') => (await (await call(`/bff/cart?tenant=${tenant}`)).json() as ApiSuccess<CartView>).data;

  return { call, post, getCart, seenRequestIds, getCookie: () => cookie };
};

describe('BFF', () => {
  test('page catalogue : agrège produits + catégories, prix formatés, stock masqué', async () => {
    const { call } = setup();
    const res = await call('/bff/catalog?tenant=fr');
    const { data } = await res.json() as ApiSuccess<CatalogPageView>;

    expect(res.status).toBe(200);
    expect(data.products).toHaveLength(9);
    expect(data.products[0]!.price.formatted).toMatch(/^1\s499,00\s€$/); // Intl uses no-break spaces
    expect(data.products.find((p) => p.id === 'galet-mini')!.available).toBe(false);
    expect(data.products.find((p) => p.id === 'onde')!.lowStock).toBe(true);
    expect(data.products.find((p) => p.id === 'galet')!.lowStock).toBe(false);
    expect(data.products[0]).not.toHaveProperty('stock');
    expect(data).not.toHaveProperty('category');
  });

  test('catégories dans l\'ordre du catalogue, avec un slug sans accent', async () => {
    const { call } = setup();
    const { data } = await (await call('/bff/catalog?tenant=fr')).json() as ApiSuccess<CatalogPageView>;

    expect(data.categories).toEqual([
      { name: 'Ordinateurs', slug: 'ordinateurs' },
      { name: 'Téléphones', slug: 'telephones' },
      { name: 'Audio', slug: 'audio' },
      { name: 'Écrans', slug: 'ecrans' },
      { name: 'Accessoires', slug: 'accessoires' },
    ]);
  });

  test('vue produit : catégorie, format, finitions, points forts', async () => {
    const { call } = setup();
    const { data } = await (await call('/bff/catalog?tenant=fr')).json() as ApiSuccess<CatalogPageView>;

    expect(data.products[0]).toEqual({
      id: 'ardoise-14',
      name: 'Ardoise 14',
      tagline: "Fin, silencieux, dix-huit heures loin d'une prise.",
      description: 'Un portable de 14 pouces en aluminium recyclé, sans ventilateur, avec un écran mat qui se lit en plein jour.',
      category: { name: 'Ordinateurs', slug: 'ordinateurs' },
      formFactor: 'laptop',
      finishes: [
        { id: 'graphite', name: 'Graphite', hex: '#3d4148' },
        { id: 'sable', name: 'Sable', hex: '#d8cbb5' },
        { id: 'brume', name: 'Brume', hex: '#b9c7d4' },
      ],
      highlights: ["18 h d'autonomie en navigation", "1,2 kg pour 11 mm d'épaisseur", 'Écran mat 14 pouces, 600 nits'],
      isNew: true,
      price: expect.objectContaining({ amountCents: 149900, currency: 'EUR' }),
      available: true,
      lowStock: false,
    });
  });

  test('filtre par slug de catégorie', async () => {
    const { call } = setup();
    const res = await call('/bff/catalog?tenant=fr&category=telephones');
    const { data } = await res.json() as ApiSuccess<CatalogPageView>;

    expect(res.status).toBe(200);
    expect(data.category).toEqual({ name: 'Téléphones', slug: 'telephones' });
    expect(data.products.map((p) => p.id)).toEqual(['galet', 'galet-mini']);
    expect(data.categories).toHaveLength(5);
  });

  test('slug de catégorie inconnu : 404 CATEGORY_NOT_FOUND', async () => {
    const { call } = setup();
    const res = await call('/bff/catalog?tenant=fr&category=tablettes');
    const body = await res.json() as ApiFailure;

    expect(res.status).toBe(404);
    expect(body.error.code).toBe('CATEGORY_NOT_FOUND');
    expect(body.error.message).toContain('tablettes');
  });

  test('page produit : le produit et ses voisins de catégorie', async () => {
    const { call } = setup();
    const res = await call('/bff/products/galet?tenant=fr');
    const { data } = await res.json() as ApiSuccess<ProductPageView>;

    expect(res.status).toBe(200);
    expect(data.product.id).toBe('galet');
    expect(data.product.category).toEqual({ name: 'Téléphones', slug: 'telephones' });
    expect(data.product).not.toHaveProperty('stock');
    expect(data.related.map((p) => p.id)).toEqual(['galet-mini']);
  });

  test('page produit : les produits liés excluent le produit lui-même', async () => {
    const { call } = setup();
    const { data } = await (await call('/bff/products/trait?tenant=fr')).json() as ApiSuccess<ProductPageView>;
    expect(data.related.map((p) => p.id)).toEqual(['relais']);

    const alone = (await (await call('/bff/products/ecran-27?tenant=fr')).json() as ApiSuccess<ProductPageView>).data;
    expect(alone.related).toEqual([]);
  });

  test('page produit inconnue dans ce pays : 404 relayé', async () => {
    const { call } = setup();
    const res = await call('/bff/products/onde?tenant=be');
    expect(res.status).toBe(404);
    expect((await res.json() as ApiFailure).error.code).toBe('PRODUCT_NOT_FOUND');
  });

  test('pose un cookie de session httpOnly', async () => {
    const { call } = setup();
    const res = await call('/bff/cart?tenant=fr');
    expect(res.headers.get('Set-Cookie')).toContain('HttpOnly');
  });

  test('panier lié à la session : création implicite puis persistance', async () => {
    const { post, getCart } = setup();

    expect((await getCart()).itemCount).toBe(0);

    await post('/bff/cart/items?tenant=fr', { productId: 'echo', finishId: 'blanc' });
    await post('/bff/cart/items?tenant=fr', { productId: 'echo', finishId: 'blanc' });

    const cart = await getCart();
    expect(cart.itemCount).toBe(2);
    expect(cart.total.formatted).toMatch(/^398,00\s€$/);
    expect(cart.lines[0]).toMatchObject({
      lineId: 'echo:blanc',
      productId: 'echo',
      name: 'Écho',
      formFactor: 'earbuds',
      finish: { id: 'blanc', name: 'Blanc', hex: '#f2f2ef' },
      quantity: 2,
    });
    expect(cart).not.toHaveProperty('id'); // the API cart id stays server-side
  });

  test('deux finitions puis suppression d\'une ligne', async () => {
    const { call, post, getCart } = setup();
    await post('/bff/cart/items?tenant=fr', { productId: 'galet', finishId: 'lin' });
    await post('/bff/cart/items?tenant=fr', { productId: 'galet', finishId: 'sauge' });
    expect((await getCart()).lines.map((line) => line.lineId)).toEqual(['galet:lin', 'galet:sauge']);

    const res = await call('/bff/cart/items/galet:lin?tenant=fr', { method: 'DELETE', headers: { Origin: 'http://localhost:3000' } });
    const { data } = await res.json() as ApiSuccess<CartView>;
    expect(res.status).toBe(200);
    expect(data.lines.map((line) => line.lineId)).toEqual(['galet:sauge']);
  });

  test('identifiant de ligne mal formé : 400', async () => {
    const { call } = setup();
    const res = await call('/bff/cart/items/galet?tenant=fr', { method: 'DELETE', headers: { Origin: 'http://localhost:3000' } });
    expect(res.status).toBe(400);
    expect((await res.json() as ApiFailure).error.code).toBe('VALIDATION_ERROR');
  });

  test('relaie les erreurs métier de l\'API (422) avec leur code', async () => {
    const { post } = setup();
    const res = await post('/bff/cart/items?tenant=fr', { productId: 'galet-mini', finishId: 'corail' });
    const body = await res.json() as ApiFailure;

    expect(res.status).toBe(422);
    expect(body.error.code).toBe('PRODUCT_UNAVAILABLE');
  });

  test('relaie le stock partagé entre finitions (422 INSUFFICIENT_STOCK)', async () => {
    const { post } = setup();
    await post('/bff/cart/items?tenant=fr', { productId: 'onde', finishId: 'argile' });
    await post('/bff/cart/items?tenant=fr', { productId: 'onde', finishId: 'brume' });
    const res = await post('/bff/cart/items?tenant=fr', { productId: 'onde', finishId: 'graphite' });

    expect(res.status).toBe(422);
    expect((await res.json() as ApiFailure).error.code).toBe('INSUFFICIENT_STOCK');
  });

  test('relaie une finition inconnue (400 INVALID_FINISH)', async () => {
    const { post } = setup();
    const res = await post('/bff/cart/items?tenant=fr', { productId: 'galet', finishId: 'corail' });

    expect(res.status).toBe(400);
    expect((await res.json() as ApiFailure).error.code).toBe('INVALID_FINISH');
  });

  test('un panier par organisation dans la même session', async () => {
    const { post, getCart } = setup();
    await post('/bff/cart/items?tenant=fr', { productId: 'galet', finishId: 'lin' });

    expect((await getCart('be')).itemCount).toBe(0);
  });

  test('propage le même request id vers l\'API', async () => {
    const { call, seenRequestIds } = setup();
    const res = await call('/bff/catalog?tenant=fr', { headers: { 'X-Request-Id': 'trace-42' } });
    const body = await res.json() as ApiSuccess<CatalogPageView>;

    expect(body.meta.requestId).toBe('trace-42');
    expect(seenRequestIds).toEqual(['trace-42', 'trace-42']);
  });

  test('API injoignable : 503 UPSTREAM_UNAVAILABLE, jamais de stack', async () => {
    const bff = createApp({ config, fetch: () => Promise.reject(new TypeError('fetch failed')) });
    const original = console.error;
    console.error = () => {};
    const res = await bff.request('/bff/catalog?tenant=fr');
    console.error = original;

    expect(res.status).toBe(503);
    expect((await res.json() as ApiFailure).error.code).toBe('UPSTREAM_UNAVAILABLE');
  });

  test('API saturée (429) : le navigateur reçoit 503 avec l\'en-tête Retry-After', async () => {
    const throttled = () => Promise.resolve(new Response(
      JSON.stringify({ success: false, error: { code: 'RATE_LIMITED', message: 'slow down' }, meta: { requestId: 'x', timestamp: '' } }),
      { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': '3' } },
    ));
    const res = await createApp({ config, fetch: throttled }).request('/bff/catalog?tenant=fr');

    expect(res.status).toBe(503);
    expect(res.headers.get('Retry-After')).toBe('3');
    expect((await res.json() as ApiFailure).error.code).toBe('UPSTREAM_BUSY');
  });

  test('refuse un formulaire posté depuis un autre site (CSRF)', async () => {
    const { call } = setup();
    const res = await call('/bff/cart/items?tenant=fr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Origin: 'https://evil.example' },
      body: 'productId=galet&finishId=lin',
    });
    expect(res.status).toBe(403);
  });
});
