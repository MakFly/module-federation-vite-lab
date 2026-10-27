// Shared kernel: product vocabulary that both the catalog and the cart contexts speak.

export const FORM_FACTORS = ['laptop', 'phone', 'earbuds', 'headphones', 'display', 'stylus', 'dock'] as const;

// The device's physical shape, used by the frontends to draw its illustration.
export type FormFactor = (typeof FORM_FACTORS)[number];

// A colour a product is sold in. Value object: compared by id within a product.
export type Finish = { id: string; name: string; hex: string };
