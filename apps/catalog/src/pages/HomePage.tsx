import { useSuspenseQuery } from '@tanstack/react-query';
import type { CatalogProductView } from '@acme/contracts';
import { catalogPageQuery } from '@acme/bff-client';
import { CategoryStrip } from '../components/CategoryStrip';
import { HeroTile } from '../components/HeroTile';
import { Shelf } from '../components/Shelf';
import { countryName, plural, useCountry } from '../lib/country';

// New products lead the home page, the rest follow in catalog order.
const featured = (products: CatalogProductView[]) =>
  [...products.filter((product) => product.isNew), ...products.filter((product) => !product.isNew)].slice(0, 4);

// Route `/:country` (index). The route loader has already filled the cache.
export function Component() {
  const country = useCountry();
  const { data: view } = useSuspenseQuery(catalogPageQuery(country));
  const [lead, second, ...pair] = featured(view.products);

  return (
    <>
      <title>Calque. La boutique.</title>
      <div className="space-y-3 bg-background pb-3">
        {lead && <HeroTile product={lead} tone="light" size="full" headingLevel="h1" />}
        {second && <HeroTile product={second} tone="dark" size="full" />}
        {pair.length > 0 && (
          <div className="grid gap-3 px-0 md:grid-cols-2 md:px-3">
            {pair.map((product) => <HeroTile key={product.id} product={product} tone="grey" size="half" />)}
          </div>
        )}
      </div>

      <section aria-labelledby="store-title" className="bg-muted pt-16 pb-6 sm:pt-20">
        <div className="mx-auto max-w-[980px] px-5">
          <h2 id="store-title" className="max-w-[24ch] text-[clamp(2rem,5vw,3.25rem)] leading-[1.06] font-semibold tracking-[-0.03em] text-balance">
            La boutique. <span className="text-muted-foreground">Tout Calque, vendu {countryName[country] ?? 'ici'}.</span>
          </h2>
        </div>
        <div className="mt-10">
          <CategoryStrip />
        </div>
        <div className="mx-auto mt-14 max-w-[980px] px-5">
          <h2 className="text-2xl font-semibold tracking-[-0.02em]">Tous les produits. <span className="text-muted-foreground">{plural(view.products.length, 'référence')}.</span></h2>
        </div>
        <div className="mt-6">
          <Shelf products={view.products} label="Tous les produits" />
        </div>
      </section>
    </>
  );
}
