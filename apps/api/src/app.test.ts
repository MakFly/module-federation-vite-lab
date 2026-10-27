import { describe, expect, test } from 'bun:test';
import type { ApiFailure, ApiSuccess, CartDto, ProductDto } from '@acme/contracts';
import { createApp } from './app.ts';

// End-to-end tests on the Hono app, no network server: app.request() is enough.
const app = createApp();
const json = (body: unknown) => ({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
const newCart = async (tenant = 'fr') =>
  (await (await app.request(`/api/v1/tenants/${tenant}/carts`, { method: 'POST' })).json() as ApiSuccess<CartDto>).data;

describe('API HTTP', () => {
  test('liste paginée avec enveloppe success + meta', async () => {
    const res = await app.request('/api/v1/tenants/fr/products?pageSize=2&page=2');
    const body = await res.json() as ApiSuccess<ProductDto[]>;

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.map((product) => product.id)).toEqual(['galet', 'galet-mini']);
    expect(body.meta.pagination).toEqual({ page: 2, pageSize: 2, total: 9, totalPages: 5 });
    expect(body.meta.requestId).toBeString();
  });

  test('fiche produit complète : finitions, points forts, format', async () => {
    const res = await app.request('/api/v1/tenants/fr/products/ardoise-14');
    const { data } = await res.json() as ApiSuccess<ProductDto>;

    expect(res.status).toBe(200);
    expect(data).toMatchObject({
      id: 'ardoise-14',
      tenantId: 'fr',
      name: 'Ardoise 14',
      tagline: "Fin, silencieux, dix-huit heures loin d'une prise.",
      category: 'Ordinateurs',
      formFactor: 'laptop',
      isNew: true,
      price: { amountCents: 149900, currency: 'EUR' },
      stock: 12,
    });
    expect(data.finishes).toEqual([
      { id: 'graphite', name: 'Graphite', hex: '#3d4148' },
      { id: 'sable', name: 'Sable', hex: '#d8cbb5' },
      { id: 'brume', name: 'Brume', hex: '#b9c7d4' },
    ]);
    expect(data.highlights).toHaveLength(3);
  });

  test('prix et stock propres à chaque pays', async () => {
    const { data } = await (await app.request('/api/v1/tenants/be/products/ardoise-14')).json() as ApiSuccess<ProductDto>;
    expect(data.price.amountCents).toBe(154900);
    expect(data.stock).toBe(5);

    const missing = await app.request('/api/v1/tenants/be/products/onde');
    expect(missing.status).toBe(404);
    expect((await missing.json() as ApiFailure).error.code).toBe('PRODUCT_NOT_FOUND');
  });

  test('catégories dans l\'ordre du catalogue, pas alphabétique', async () => {
    const { data } = await (await app.request('/api/v1/tenants/fr/categories')).json() as ApiSuccess<string[]>;
    expect(data).toEqual(['Ordinateurs', 'Téléphones', 'Audio', 'Écrans', 'Accessoires']);
  });

  test('propage le X-Request-Id reçu', async () => {
    const res = await app.request('/health', { headers: { 'X-Request-Id': 'from-bff-123' } });
    const body = await res.json() as ApiSuccess<unknown>;
    expect(body.meta.requestId).toBe('from-bff-123');
  });

  test('erreur de validation : 400 + details par champ', async () => {
    const res = await app.request('/api/v1/tenants/BAD!/products?pageSize=999');
    const body = await res.json() as ApiFailure;

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.details?.map((detail) => detail.field)).toContain('tenantId');
  });

  test('organisation inconnue : 404 TENANT_NOT_FOUND', async () => {
    const res = await app.request('/api/v1/tenants/inconnue/products');
    expect(res.status).toBe(404);
    expect((await res.json() as ApiFailure).error.code).toBe('TENANT_NOT_FOUND');
  });

  test('JSON mal formé : 400 BAD_REQUEST', async () => {
    const cart = await newCart();
    const res = await app.request(`/api/v1/tenants/fr/carts/${cart.id}/items`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{oops',
    });
    expect(res.status).toBe(400);
    expect((await res.json() as ApiFailure).error.code).toBe('BAD_REQUEST');
  });

  test('parcours panier : création, ajouts, règle métier, suppression', async () => {
    const createRes = await app.request('/api/v1/tenants/fr/carts', { method: 'POST' });
    const cart = (await createRes.json() as ApiSuccess<CartDto>).data;
    expect(createRes.status).toBe(201);
    expect(createRes.headers.get('Location')).toBe(`/api/v1/tenants/fr/carts/${cart.id}`);

    const base = `/api/v1/tenants/fr/carts/${cart.id}`;
    const added = await (await app.request(`${base}/items`, json({ productId: 'onde', finishId: 'argile', quantity: 2 }))).json() as ApiSuccess<CartDto>;
    expect(added.data.total).toEqual({ amountCents: 69800, currency: 'EUR' });
    expect(added.data.lines[0]).toMatchObject({
      lineId: 'onde:argile',
      productId: 'onde',
      formFactor: 'headphones',
      finish: { id: 'argile', name: 'Argile', hex: '#c08b6a' },
      quantity: 2,
    });

    // Onde: stock of 2, the 3rd is rejected by the domain -> 422, whatever the finish.
    const refused = await app.request(`${base}/items`, json({ productId: 'onde', finishId: 'brume' }));
    expect(refused.status).toBe(422);
    expect((await refused.json() as ApiFailure).error.code).toBe('INSUFFICIENT_STOCK');

    const removed = await (await app.request(`${base}/items/onde:argile`, { method: 'DELETE' })).json() as ApiSuccess<CartDto>;
    expect(removed.data.itemCount).toBe(0);
  });

  test('deux finitions du même produit : deux lignes', async () => {
    const base = `/api/v1/tenants/fr/carts/${(await newCart()).id}`;
    await app.request(`${base}/items`, json({ productId: 'galet', finishId: 'lin' }));
    const { data } = await (await app.request(`${base}/items`, json({ productId: 'galet', finishId: 'sauge' }))).json() as ApiSuccess<CartDto>;

    expect(data.lines.map((line) => line.lineId)).toEqual(['galet:lin', 'galet:sauge']);
    expect(data.itemCount).toBe(2);
  });

  test('finition inconnue : 400 INVALID_FINISH', async () => {
    const base = `/api/v1/tenants/fr/carts/${(await newCart()).id}`;
    const res = await app.request(`${base}/items`, json({ productId: 'galet', finishId: 'corail' }));

    expect(res.status).toBe(400);
    expect((await res.json() as ApiFailure).error.code).toBe('INVALID_FINISH');
  });

  test('produit en rupture : 422 PRODUCT_UNAVAILABLE', async () => {
    const base = `/api/v1/tenants/fr/carts/${(await newCart()).id}`;
    const res = await app.request(`${base}/items`, json({ productId: 'galet-mini', finishId: 'corail' }));

    expect(res.status).toBe(422);
    expect((await res.json() as ApiFailure).error.code).toBe('PRODUCT_UNAVAILABLE');
  });

  test('finishId obligatoire et identifiant de ligne validé', async () => {
    const base = `/api/v1/tenants/fr/carts/${(await newCart()).id}`;

    const noFinish = await app.request(`${base}/items`, json({ productId: 'galet' }));
    expect(noFinish.status).toBe(400);
    expect((await noFinish.json() as ApiFailure).error.details?.map((detail) => detail.field)).toContain('finishId');

    const badLine = await app.request(`${base}/items/galet`, { method: 'DELETE' });
    expect(badLine.status).toBe(400);
    expect((await badLine.json() as ApiFailure).error.details?.map((detail) => detail.field)).toContain('lineId');

    const absent = await app.request(`${base}/items/galet:lin`, { method: 'DELETE' });
    expect(absent.status).toBe(404);
    expect((await absent.json() as ApiFailure).error.code).toBe('CART_LINE_NOT_FOUND');
  });

  test("un panier n'est pas visible depuis une autre organisation", async () => {
    const cart = await newCart('fr');
    const res = await app.request(`/api/v1/tenants/be/carts/${cart.id}`);
    expect(res.status).toBe(404);
  });

  test('route inconnue : 404 ROUTE_NOT_FOUND dans la même enveloppe', async () => {
    const res = await app.request('/api/v2/nope');
    expect((await res.json() as ApiFailure).error.code).toBe('ROUTE_NOT_FOUND');
  });
});
