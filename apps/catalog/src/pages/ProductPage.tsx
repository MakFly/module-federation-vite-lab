import { useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router';
import type { CatalogProductView } from '@acme/contracts';
import { paths, productPageQuery } from '@acme/bff-client';
import { DeviceArt } from '@acme/ui/components/device-art';
import { cn } from '@acme/ui/lib/utils';
import { FinishPicker } from '../components/FinishPicker';
import { ProductCard } from '../components/ProductCard';
import { useCountry } from '../lib/country';
import { useAddToBag } from '../lib/use-add-to-bag';

// "11 mm", "14 pouces", "18 h": a number never wraps away from its unit.
const keepUnits = (text: string) => text.replace(/(\d)\s+(?=[^\s\d])/g, '$1 ');

function stockNote(product: CatalogProductView) {
  if (!product.available) return { text: 'Épuisé pour le moment.', className: 'text-muted-foreground' };
  if (product.lowStock) return { text: 'Plus que quelques exemplaires.', className: 'text-signal' };
  return { text: 'En stock.', className: 'text-muted-foreground' };
}

function AddButton({ product, adding, onClick, className }: { product: CatalogProductView; adding: boolean; onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      disabled={!product.available || adding}
      onClick={onClick}
      className={cn('rounded-full bg-primary font-medium text-primary-foreground transition-colors hover:bg-[#0062c4] disabled:opacity-40', className)}
    >
      {!product.available ? 'Épuisé' : adding ? 'Ajout…' : 'Ajouter au sac'}
    </button>
  );
}

function ProductScreen({ country, productId }: { country: string; productId: string }) {
  const { data: page } = useSuspenseQuery(productPageQuery(country, productId));
  const [finishId, setFinishId] = useState(page.product.finishes[0]!.id);
  const { adding, add } = useAddToBag(country, productId);

  const { product, related } = page;
  const finish = product.finishes.find((item) => item.id === finishId) ?? product.finishes[0]!;
  const stock = stockNote(product);

  return (
    <>
      <title>{`${product.name}. Calque.`}</title>

      {/* Product sub-nav: sticks under the shell's global nav (44px). */}
      <div className="sticky top-11 z-30 border-b border-black/10 bg-white/80 backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex h-13 max-w-[980px] items-center justify-between gap-4 px-5">
          <Link to={paths.category(country, product.category.slug)} className="truncate text-xl font-semibold tracking-[-0.02em]">
            {product.name}
          </Link>
          <div className="flex shrink-0 items-center gap-4">
            <span className="hidden text-xs text-muted-foreground sm:inline">{product.price.formatted}</span>
            <AddButton product={product} adding={adding} onClick={() => add(finish.id)} className="h-7 px-3 text-xs" />
          </div>
        </div>
      </div>

      <div className="bg-background">
        <section aria-labelledby="product-title" className="mx-auto grid max-w-[1180px] gap-8 px-5 pt-8 pb-16 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] md:gap-12 md:pt-14 lg:pb-24">
          <div className="md:sticky md:top-32 md:self-start">
            <div className="flex aspect-square items-center justify-center rounded-[28px] bg-muted p-[8%] md:aspect-[5/4]">
              <DeviceArt formFactor={product.formFactor} finish={finish.hex} title={`${product.name}, finition ${finish.name}`} className="max-h-full" />
            </div>
          </div>

          <div className="flex flex-col md:py-6">
            <h1 id="product-title" className="text-[clamp(2.5rem,5vw,3.5rem)] leading-[1.04] font-semibold tracking-[-0.035em]">
              {product.name}
            </h1>
            {product.isNew && <p className="mt-2 text-sm font-medium text-signal">Nouveau</p>}
            <p className="mt-4 text-[1.375rem] leading-snug text-balance">{product.tagline}</p>
            <p className="mt-4 max-w-[52ch] text-[17px] leading-relaxed text-muted-foreground">{product.description}</p>

            <div className="mt-8 border-t pt-8">
              <h2 className="text-[17px] font-semibold">Finition. <span className="font-normal text-muted-foreground">Choisis ta couleur.</span></h2>
              <div className="mt-5">
                <FinishPicker finishes={product.finishes} value={finish.id} onChange={setFinishId} label={`Finition de ${product.name}`} size="lg" align="start" />
              </div>
            </div>

            <div className="mt-8 border-t pt-8">
              <p className="text-2xl font-semibold tracking-[-0.02em]">{product.price.formatted}</p>
              <p className={cn('mt-1 text-sm', stock.className)}>{stock.text}</p>
              <AddButton product={product} adding={adding} onClick={() => add(finish.id)} className="mt-6 h-12 w-full text-[17px]" />
            </div>
          </div>
        </section>
      </div>

      <section aria-labelledby="highlights-title" className="bg-tile-dark py-20 text-tile-dark-foreground sm:py-28">
        <div className="mx-auto max-w-[980px] px-5">
          <h2 id="highlights-title" className="text-[clamp(2rem,5vw,3.25rem)] leading-[1.06] font-semibold tracking-[-0.03em]">
            {product.name} en trois points.
          </h2>
          <ul className="mt-12 grid gap-10 sm:grid-cols-3 sm:gap-8">
            {product.highlights.map((highlight) => (
              <li key={highlight} className="border-t border-white/20 pt-6 text-[1.375rem] leading-snug font-semibold tracking-[-0.02em] text-balance">
                {keepUnits(highlight)}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="bg-muted py-20">
          <div className="mx-auto max-w-[980px] px-5">
            <h2 id="related-title" className="text-2xl font-semibold tracking-[-0.02em]">
              Dans la même catégorie. <Link to={paths.category(country, product.category.slug)} className="text-link hover:underline">Tout voir : {product.category.name}</Link>
            </h2>
            <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => <li key={item.id}><ProductCard product={item} className="h-full" /></li>)}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}

// Route `/:country/produit/:id`. Moving from one product to another reuses this route element:
// the key gives each product a fresh screen, so the chosen finish does not leak across products.
export function Component() {
  const country = useCountry();
  const { id } = useParams();
  return <ProductScreen key={`${country}:${id}`} country={country} productId={id!} />;
}
