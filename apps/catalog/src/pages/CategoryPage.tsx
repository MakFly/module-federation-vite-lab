import { useSuspenseQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';
import { catalogPageQuery } from '@acme/bff-client';
import { cn } from '@acme/ui/lib/utils';
import { CategoryStrip } from '../components/CategoryStrip';
import { HeroTile } from '../components/HeroTile';
import { plural, useCountry } from '../lib/country';

// Route `/:country/boutique/:slug`. Category pages keep the store's thesis: every product at hero
// scale and buyable where it is shown. Two columns from md, in a grey / black checkerboard;
// a lone product gets the full tile.
export function Component() {
  const country = useCountry();
  const { slug } = useParams();
  const { data: view } = useSuspenseQuery(catalogPageQuery(country, { category: slug }));
  const category = view.category!;
  const single = view.products.length === 1;

  return (
    <>
      <title>{`${category.name}. Calque.`}</title>
      <div className="bg-muted pb-20">
        <div className="mx-auto max-w-[980px] px-5 pt-14 pb-8 sm:pt-20">
          <h1 className="text-[clamp(2.5rem,7vw,4.5rem)] leading-[1.02] font-semibold tracking-[-0.035em]">{category.name}</h1>
          <p className="mt-3 text-lg text-muted-foreground">{plural(view.products.length, 'produit')}</p>
        </div>
        <CategoryStrip />
        <ul className={cn('mt-10 grid gap-3 md:px-3', !single && 'md:grid-cols-2')}>
          {view.products.map((product, index) => (
            <li key={product.id} className="flex">
              <div className="w-full [&>section]:h-full">
                <HeroTile product={product} tone={index % 4 === 1 || index % 4 === 2 ? 'dark' : 'light'} size={single ? 'full' : 'half'} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
