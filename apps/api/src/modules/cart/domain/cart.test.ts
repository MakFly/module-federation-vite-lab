import { describe, expect, test } from 'bun:test';
import { BusinessRuleViolation, NotFoundError, ValidationError } from '../../../shared/domain/errors.ts';
import { Money } from '../../../shared/domain/money.ts';
import { Cart, MAX_QUANTITY_PER_LINE } from './cart.ts';
import type { ProductSnapshot } from './product-snapshot.ts';

const graphite = { id: 'graphite', name: 'Graphite', hex: '#3d4148' };
const sable = { id: 'sable', name: 'Sable', hex: '#d8cbb5' };

const laptop: ProductSnapshot = { id: 'ardoise-14', name: 'Ardoise 14', formFactor: 'laptop', finishes: [graphite, sable], price: Money.of(149900), stock: 12 };
const headphones: ProductSnapshot = { id: 'onde', name: 'Onde', formFactor: 'headphones', finishes: [graphite, sable], price: Money.of(34900), stock: 2 };

const newCart = () => Cart.create('cart-1', 'fr');

describe('Cart', () => {
  test('cumule les quantités et calcule le total', () => {
    const cart = newCart();
    cart.addItem(laptop, 'graphite', 2);
    cart.addItem(laptop, 'graphite', 1);
    cart.addItem(headphones, 'sable', 1);

    expect(cart.lines).toHaveLength(2);
    expect(cart.itemCount()).toBe(4);
    expect(cart.total().equals(Money.of(3 * 149900 + 34900))).toBe(true);
  });

  test('deux finitions du même produit donnent deux lignes', () => {
    const cart = newCart();
    cart.addItem(laptop, 'graphite', 1);
    cart.addItem(laptop, 'sable', 1);

    expect(cart.lines.map((line) => line.lineId)).toEqual(['ardoise-14:graphite', 'ardoise-14:sable']);
    expect(cart.lines[1]!.finish).toEqual(sable);
    expect(cart.lines[1]!.formFactor).toBe('laptop');
  });

  test('refuse une quantité invalide', () => {
    expect(() => newCart().addItem(laptop, 'graphite', 0)).toThrow(ValidationError);
    expect(() => newCart().addItem(laptop, 'graphite', 1.5)).toThrow(ValidationError);
  });

  test('refuse une finition que le produit ne propose pas', () => {
    expect(() => newCart().addItem(laptop, 'corail', 1)).toThrow(expect.objectContaining({ code: 'INVALID_FINISH' }));
    expect(() => newCart().addItem(laptop, 'corail', 1)).toThrow(ValidationError);
  });

  test('refuse un produit en rupture', () => {
    expect(() => newCart().addItem({ ...laptop, stock: 0 }, 'graphite', 1)).toThrow(BusinessRuleViolation);
  });

  test(`plafonne à ${MAX_QUANTITY_PER_LINE} par ligne`, () => {
    const cart = newCart();
    cart.addItem(laptop, 'graphite', MAX_QUANTITY_PER_LINE);
    expect(() => cart.addItem(laptop, 'graphite', 1)).toThrow(expect.objectContaining({ code: 'MAX_QUANTITY_EXCEEDED' }));
    // Another finish is another line, with its own cap.
    expect(() => cart.addItem(laptop, 'sable', 1)).not.toThrow();
  });

  test('ne dépasse jamais le stock', () => {
    const cart = newCart();
    cart.addItem(headphones, 'graphite', 2);
    expect(() => cart.addItem(headphones, 'graphite', 1)).toThrow(expect.objectContaining({ code: 'INSUFFICIENT_STOCK' }));
  });

  test('le stock est partagé entre toutes les finitions du produit', () => {
    const cart = newCart();
    cart.addItem(headphones, 'graphite', 1);
    cart.addItem(headphones, 'sable', 1);
    expect(() => cart.addItem(headphones, 'sable', 1)).toThrow(expect.objectContaining({ code: 'INSUFFICIENT_STOCK' }));
    expect(cart.itemCount()).toBe(2);
  });

  test('fige le prix au premier ajout', () => {
    const cart = newCart();
    cart.addItem(laptop, 'graphite', 1);
    cart.addItem({ ...laptop, price: Money.of(1) }, 'graphite', 1);
    expect(cart.lines[0]!.unitPrice.amountCents).toBe(149900);
  });

  test('retire une ligne par son identifiant', () => {
    const cart = newCart();
    cart.addItem(laptop, 'graphite', 1);
    cart.addItem(laptop, 'sable', 1);
    cart.removeItem('ardoise-14:graphite');
    expect(cart.lines.map((line) => line.lineId)).toEqual(['ardoise-14:sable']);
  });

  test('retirer une ligne absente lève NotFoundError', () => {
    expect(() => newCart().removeItem('ardoise-14:graphite')).toThrow(NotFoundError);
  });

  test('snapshot puis restore donne le même panier', () => {
    const cart = newCart();
    cart.addItem(laptop, 'graphite', 2);
    cart.addItem(laptop, 'sable', 1);
    const restored = Cart.restore(cart.toSnapshot());
    expect(restored.toSnapshot()).toEqual(cart.toSnapshot());
    expect(restored.lines[1]!.lineId).toBe('ardoise-14:sable');
  });
});
