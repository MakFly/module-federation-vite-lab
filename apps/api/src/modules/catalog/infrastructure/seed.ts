import type { Finish, FormFactor } from '../../../shared/domain/finish.ts';
import { Money } from '../../../shared/domain/money.ts';
import { Product } from '../domain/product.ts';

// Finish palette, reused by id across products.
const palette = {
  graphite: { id: 'graphite', name: 'Graphite', hex: '#3d4148' },
  sable: { id: 'sable', name: 'Sable', hex: '#d8cbb5' },
  brume: { id: 'brume', name: 'Brume', hex: '#b9c7d4' },
  argent: { id: 'argent', name: 'Argent', hex: '#cfd2d6' },
  ardoise: { id: 'ardoise', name: 'Ardoise', hex: '#2f343b' },
  lin: { id: 'lin', name: 'Lin', hex: '#e6dccb' },
  sauge: { id: 'sauge', name: 'Sauge', hex: '#9fb39a' },
  corail: { id: 'corail', name: 'Corail', hex: '#e48a7a' },
  blanc: { id: 'blanc', name: 'Blanc', hex: '#f2f2ef' },
  nuit: { id: 'nuit', name: 'Nuit', hex: '#23262c' },
  argile: { id: 'argile', name: 'Argile', hex: '#c08b6a' },
} satisfies Record<string, Finish>;

type FinishId = keyof typeof palette;

// Product truth shared by every country: texts, shape and finishes. Ids are URL slugs.
type Definition = {
  name: string;
  tagline: string;
  description: string;
  category: string;
  formFactor: FormFactor;
  finishes: FinishId[];
  highlights: string[];
  isNew?: boolean;
};

const definitions = {
  'ardoise-14': {
    name: 'Ardoise 14',
    tagline: "Fin, silencieux, dix-huit heures loin d'une prise.",
    description: 'Un portable de 14 pouces en aluminium recyclé, sans ventilateur, avec un écran mat qui se lit en plein jour.',
    category: 'Ordinateurs',
    formFactor: 'laptop',
    finishes: ['graphite', 'sable', 'brume'],
    highlights: ["18 h d'autonomie en navigation", "1,2 kg pour 11 mm d'épaisseur", 'Écran mat 14 pouces, 600 nits'],
    isNew: true,
  },
  'ardoise-16': {
    name: 'Ardoise 16 Pro',
    tagline: 'Seize pouces pour le montage, la 3D et le code qui compile.',
    description: 'La grande Ardoise, avec deux fois plus de cœurs graphiques et un refroidissement qui reste discret sous charge.',
    category: 'Ordinateurs',
    formFactor: 'laptop',
    finishes: ['graphite', 'argent'],
    highlights: ['Écran 16 pouces à 120 Hz', "Jusqu'à 64 Go de mémoire", 'Trois ports Thunderbolt et un HDMI'],
  },
  galet: {
    name: 'Galet',
    tagline: 'Le téléphone qui tient dans la main.',
    description: 'Des bords arrondis comme un galet, un dos en verre dépoli et un appareil photo qui reste net en basse lumière.',
    category: 'Téléphones',
    formFactor: 'phone',
    finishes: ['ardoise', 'lin', 'sauge'],
    highlights: ['Écran 6,1 pouces', 'Capteur principal de 48 Mpx', 'Recharge sans fil 25 W'],
    isNew: true,
  },
  'galet-mini': {
    name: 'Galet mini',
    tagline: 'Toute la puissance de Galet, en 5,4 pouces.',
    description: 'La même puce et le même appareil photo que Galet, dans un format qui se glisse dans une poche de chemise.',
    category: 'Téléphones',
    formFactor: 'phone',
    finishes: ['ardoise', 'corail'],
    highlights: ['Écran 5,4 pouces', 'Capteur principal de 48 Mpx', '138 grammes'],
  },
  echo: {
    name: 'Écho',
    tagline: 'Le silence, dans un étui de poche.',
    description: "Des écouteurs à réduction de bruit active qui s'adaptent à ton oreille et à la pièce où tu te trouves.",
    category: 'Audio',
    formFactor: 'earbuds',
    finishes: ['blanc', 'nuit'],
    highlights: ['Réduction de bruit active', "6 h d'écoute, 30 h avec l'étui", 'Résistants à la pluie'],
    isNew: true,
  },
  onde: {
    name: 'Onde',
    tagline: 'Un casque pour écouter vraiment.',
    description: 'Un casque circum-auriculaire aux coussinets à mémoire de forme, avec un son réglé en studio.',
    category: 'Audio',
    formFactor: 'headphones',
    finishes: ['argile', 'graphite', 'brume'],
    highlights: ["40 h d'autonomie", 'Coussinets à mémoire de forme', 'Se replie dans son étui'],
  },
  'ecran-27': {
    name: 'Écran 27',
    tagline: "Un écran 5K, calibré à la sortie de l'usine.",
    description: 'Une dalle 27 pouces 5K, une caméra intégrée et un seul câble pour alimenter ton portable.',
    category: 'Écrans',
    formFactor: 'display',
    finishes: ['argent'],
    highlights: ['27 pouces, 5120 × 2880', 'Caméra 12 Mpx et trois micros', 'Charge ton portable en 96 W'],
  },
  trait: {
    name: 'Trait',
    tagline: 'Écrire et dessiner, sans latence visible.',
    description: "Un stylet à pointe fine qui se recharge en se fixant sur le côté de l'Ardoise.",
    category: 'Accessoires',
    formFactor: 'stylus',
    finishes: ['blanc', 'graphite'],
    highlights: ['9 ms de latence', 'Recharge magnétique', 'Pointe interchangeable'],
  },
  relais: {
    name: 'Relais',
    tagline: 'Un câble, tout ton bureau.',
    description: 'Un dock qui relie écran, réseau, disques et chargeur à ton ordinateur en un seul geste.',
    category: 'Accessoires',
    formFactor: 'dock',
    finishes: ['graphite', 'argent'],
    highlights: ['Dix ports', 'Alimentation 100 W', 'Deux écrans 4K'],
  },
} satisfies Record<string, Definition>;

type ProductId = keyof typeof definitions;
type Offer = [id: ProductId, priceCents: number, stock: number];

// What each country sells, at which price and with which stock (in seed order, which drives category order).
// Stock is deliberately low or empty on some products to trigger the business rules.
const offers: Record<string, Offer[]> = {
  fr: [
    ['ardoise-14', 149900, 12],
    ['ardoise-16', 249900, 3],
    ['galet', 89900, 30],
    ['galet-mini', 69900, 0],
    ['echo', 19900, 50],
    ['onde', 34900, 2],
    ['ecran-27', 129900, 7],
    ['trait', 12900, 40],
    ['relais', 17900, 15],
  ],
  be: [
    ['ardoise-14', 154900, 5],
    ['galet', 92900, 8],
    ['echo', 20900, 1],
    ['ecran-27', 134900, 0],
    ['trait', 13500, 20],
  ],
};

export const seedProducts = (): Product[] =>
  Object.entries(offers).flatMap(([tenantId, tenantOffers]) =>
    tenantOffers.map(([id, priceCents, stock]) => {
      const { finishes, isNew = false, ...definition }: Definition = definitions[id];
      return Product.create({
        ...definition,
        id,
        tenantId,
        finishes: finishes.map((finishId) => palette[finishId]),
        isNew,
        price: Money.of(priceCents),
        stock,
      });
    }),
  );
