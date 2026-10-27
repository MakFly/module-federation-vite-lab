import { ValidationError } from '../../../shared/domain/errors.ts';
import { FORM_FACTORS, type Finish, type FormFactor } from '../../../shared/domain/finish.ts';
import type { Money } from '../../../shared/domain/money.ts';

export type ProductProps = {
  id: string;
  tenantId: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  formFactor: FormFactor;
  finishes: Finish[];
  highlights: string[];
  isNew: boolean;
  price: Money;
  stock: number;
};

const FINISH_ID = /^[a-z0-9-]{1,32}$/;
const HEX_COLOR = /^#[0-9a-f]{6}$/i;

function assertFinishes(name: string, finishes: Finish[]) {
  if (finishes.length === 0) {
    throw new ValidationError('INVALID_PRODUCT', `« ${name} » doit proposer au moins une finition`);
  }
  const ids = new Set<string>();
  for (const finish of finishes) {
    if (!FINISH_ID.test(finish.id) || !finish.name.trim() || !HEX_COLOR.test(finish.hex)) {
      throw new ValidationError('INVALID_PRODUCT', `Finition « ${finish.id} » invalide pour « ${name} »`);
    }
    if (ids.has(finish.id)) {
      throw new ValidationError('INVALID_PRODUCT', `Finition « ${finish.id} » en double pour « ${name} »`);
    }
    ids.add(finish.id);
  }
}

// Entity: a stable identity and the rules that concern it. No public setter.
export class Product {
  private constructor(private readonly props: ProductProps) {}

  static create(props: ProductProps): Product {
    if (!props.name.trim()) throw new ValidationError('INVALID_PRODUCT', 'Le nom du produit est obligatoire');
    if (!Number.isInteger(props.stock) || props.stock < 0) {
      throw new ValidationError('INVALID_PRODUCT', `Stock invalide pour « ${props.name} »`);
    }
    if (!FORM_FACTORS.includes(props.formFactor)) {
      throw new ValidationError('INVALID_PRODUCT', `Format « ${props.formFactor} » inconnu pour « ${props.name} »`);
    }
    assertFinishes(props.name, props.finishes);

    return new Product({
      ...props,
      name: props.name.trim(),
      finishes: props.finishes.map((finish) => ({ ...finish })),
      highlights: [...props.highlights],
    });
  }

  get id() { return this.props.id; }
  get tenantId() { return this.props.tenantId; }
  get name() { return this.props.name; }
  get tagline() { return this.props.tagline; }
  get description() { return this.props.description; }
  get category() { return this.props.category; }
  get formFactor() { return this.props.formFactor; }
  // Copies: the entity's internal arrays never leak out.
  get finishes(): Finish[] { return this.props.finishes.map((finish) => ({ ...finish })); }
  get highlights(): string[] { return [...this.props.highlights]; }
  get isNew() { return this.props.isNew; }
  get price() { return this.props.price; }
  get stock() { return this.props.stock; }

  isAvailable(): boolean {
    return this.props.stock > 0;
  }

  matches({ search, category }: { search?: string; category?: string }): boolean {
    const term = search?.toLocaleLowerCase('fr');
    return (!term || this.props.name.toLocaleLowerCase('fr').includes(term))
      && (!category || this.props.category === category);
  }
}
