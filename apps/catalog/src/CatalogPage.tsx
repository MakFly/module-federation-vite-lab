import { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, RotateCw } from 'lucide-react';
import type { CatalogPageProps, CatalogPageView, CatalogProductView } from '@acme/contracts';
import { BffRequestError, catalogPageQuery, paths } from '@acme/bff-client';
import { DeviceArt } from '@acme/ui/components/device-art';
import { cn } from '@acme/ui/lib/utils';
import { HeroTile } from './HeroTile';
import { ProductCard } from './ProductCard';
import { plural, useAddingKeys, WithQueryClient } from './shared';
import './catalog.css';

const countryName: Record<string, string> = { fr: 'en France', be: 'en Belgique' };

// New products lead the home page, the rest follow in catalog order.
const featured = (products: CatalogProductView[]) =>
  [...products.filter((product) => product.isNew), ...products.filter((product) => !product.isNew)].slice(0, 4);

function Shelf({ products, label }: { products: CatalogProductView[]; label: string }) {
  const track = useRef<HTMLUListElement>(null);
  // Scrolling is a reaction to the click, so it lives in the handler.
  const scroll = (direction: 1 | -1) => track.current?.scrollBy({ left: direction * track.current.clientWidth * 0.8, behavior: 'smooth' });

  return (
    <div className="relative">
      <ul
        ref={track}
        aria-label={label}
        className="flex snap-x snap-mandatory scroll-px-5 gap-5 overflow-x-auto px-5 pt-2 pb-10 [scrollbar-width:none] sm:scroll-px-[max(1.25rem,calc((100vw-980px)/2))] sm:px-[max(1.25rem,calc((100vw-980px)/2))]"
      >
        {products.map((product) => (
          <li key={product.id} className="w-[78vw] max-w-[320px] shrink-0 snap-start sm:w-[300px]">
            <ProductCard product={product} className="h-full" />
          </li>
        ))}
      </ul>
      <div className="mx-auto hidden max-w-[980px] justify-end gap-3 px-5 sm:flex">
        {([[-1, ChevronLeft, 'Produits précédents'], [1, ChevronRight, 'Produits suivants']] as const).map(([direction, Icon, name]) => (
          <button
            key={direction}
            type="button"
            onClick={() => scroll(direction)}
            aria-label={name}
            className="flex size-9 items-center justify-center rounded-full bg-secondary text-foreground/80 transition-colors hover:bg-[#dcdce1]"
          >
            <Icon aria-hidden="true" className="size-5" />
          </button>
        ))}
      </div>
    </div>
  );
}

// The strip sits on #f5f5f7: draw each thumbnail in its darkest finish so a white stylus stays visible.
const luminance = (hex: string) => [1, 3, 5].reduce((sum, index, channel) => sum + parseInt(hex.slice(index, index + 2), 16) * [0.2126, 0.7152, 0.0722][channel]!, 0);
const darkestFinish = (product: CatalogProductView) =>
  product.finishes.reduce((darkest, finish) => (luminance(finish.hex) < luminance(darkest.hex) ? finish : darkest)).hex;

function CategoryStrip({ tenantId, current }: { tenantId: string; current?: string }) {
  // Always the unfiltered catalog (shared cache with the home page), so every category has its picture.
  const { data: view } = useQuery(catalogPageQuery(tenantId));
  if (!view) return null;
  return (
    <nav aria-label="Catégories" className="overflow-x-auto [scrollbar-width:none]">
      <ul className="mx-auto flex w-max gap-2 px-5 sm:gap-6">
        {view.categories.map((category) => {
          const sample = view.products.find((product) => product.category.slug === category.slug);
          const active = category.slug === current;
          return (
            <li key={category.slug}>
              <a
                href={paths.category(category.slug)}
                aria-current={active ? 'page' : undefined}
                className="group flex w-24 flex-col items-center gap-2 rounded-xl px-1 py-2 text-center sm:w-28"
              >
                <span className="flex h-14 w-20 items-end justify-center">
                  {sample && <DeviceArt formFactor={sample.formFactor} finish={darkestFinish(sample)} className="max-h-14 w-auto transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-0.5" />}
                </span>
                <span className={cn('text-[13px] leading-tight', active ? 'font-semibold text-foreground' : 'text-foreground/80 group-hover:text-foreground')}>
                  {category.name}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  const notFound = error instanceof BffRequestError && error.status === 404;
  return (
    <div role="alert" className="mx-auto flex max-w-[640px] flex-col items-center px-5 py-28 text-center">
      <h1 className="text-[2.5rem] font-semibold tracking-[-0.03em]">{notFound ? 'Cette page n’existe pas.' : 'La boutique ne répond pas.'}</h1>
      <p className="mt-3 text-lg text-muted-foreground">{error.message}</p>
      {notFound ? (
        <a href={paths.home} className="mt-6 text-link hover:underline">Revenir à l’accueil</a>
      ) : (
        <button type="button" onClick={onRetry} className="mt-6 inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-[15px] font-medium text-primary-foreground">
          <RotateCw aria-hidden="true" className="size-4" /> Réessayer
        </button>
      )}
    </div>
  );
}

function Home({ view, tenantId, onAddToBag }: { view: CatalogPageView } & Pick<CatalogPageProps, 'tenantId' | 'onAddToBag'>) {
  const adding = useAddingKeys(tenantId);
  const [lead, second, ...pair] = featured(view.products);
  const tile = (product: CatalogProductView, tone: 'light' | 'grey' | 'dark', size: 'full' | 'half', headingLevel?: 'h1' | 'h2') => (
    <HeroTile key={product.id} product={product} tone={tone} size={size} headingLevel={headingLevel} adding={adding.has(product.id)} onAddToBag={onAddToBag} />
  );

  return (
    <>
      <title>Calque. La boutique.</title>
      <div className="space-y-3 bg-background pb-3">
        {lead && tile(lead, 'light', 'full', 'h1')}
        {second && tile(second, 'dark', 'full')}
        {pair.length > 0 && (
          <div className="grid gap-3 px-0 md:grid-cols-2 md:px-3">
            {pair.map((product) => tile(product, 'grey', 'half'))}
          </div>
        )}
      </div>

      <section aria-labelledby="store-title" className="bg-muted pt-16 pb-6 sm:pt-20">
        <div className="mx-auto max-w-[980px] px-5">
          <h2 id="store-title" className="max-w-[24ch] text-[clamp(2rem,5vw,3.25rem)] leading-[1.06] font-semibold tracking-[-0.03em] text-balance">
            La boutique. <span className="text-muted-foreground">Tout Calque, vendu {countryName[tenantId] ?? 'ici'}.</span>
          </h2>
        </div>
        <div className="mt-10">
          <CategoryStrip tenantId={tenantId} />
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

// Category pages keep the store's thesis: every product at hero scale and buyable where it is shown.
// Two columns from md, in a grey / black checkerboard; a lone product gets the full tile.
function Category({ view, tenantId, onAddToBag }: { view: CatalogPageView } & Pick<CatalogPageProps, 'tenantId' | 'onAddToBag'>) {
  const category = view.category!;
  const adding = useAddingKeys(tenantId);
  const single = view.products.length === 1;
  return (
    <>
      <title>{`${category.name}. Calque.`}</title>
      <div className="bg-muted pb-20">
        <div className="mx-auto max-w-[980px] px-5 pt-14 pb-8 sm:pt-20">
          <h1 className="text-[clamp(2.5rem,7vw,4.5rem)] leading-[1.02] font-semibold tracking-[-0.035em]">{category.name}</h1>
          <p className="mt-3 text-lg text-muted-foreground">{plural(view.products.length, 'produit')}</p>
        </div>
        <CategoryStrip tenantId={tenantId} current={category.slug} />
        <ul className={cn('mt-10 grid gap-3 md:px-3', !single && 'md:grid-cols-2')}>
          {view.products.map((product, index) => (
            <li key={product.id} className="flex">
              <div className="w-full [&>section]:h-full">
                <HeroTile
                  product={product}
                  tone={index % 4 === 1 || index % 4 === 2 ? 'dark' : 'light'}
                  size={single ? 'full' : 'half'}
                  adding={adding.has(product.id)}
                  onAddToBag={onAddToBag}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

function CatalogScreen({ tenantId, categorySlug, onAddToBag }: CatalogPageProps) {
  const catalog = useQuery(catalogPageQuery(tenantId, { category: categorySlug }));

  if (catalog.isError) return <ErrorState error={catalog.error} onRetry={() => catalog.refetch()} />;
  if (!catalog.data) {
    return <div role="status" aria-label="Chargement de la boutique" className="mx-3 mt-3 h-[80svh] rounded-[28px] bg-background motion-safe:animate-pulse" />;
  }

  return (
    <div className={cn('transition-opacity duration-300', catalog.isPlaceholderData && 'opacity-60')}>
      {categorySlug ? <Category view={catalog.data} tenantId={tenantId} onAddToBag={onAddToBag} /> : <Home view={catalog.data} tenantId={tenantId} onAddToBag={onAddToBag} />}
    </div>
  );
}

// Exposed as `catalog/CatalogPage`: the home page, or a category page when `categorySlug` is set.
export default function CatalogPage(props: CatalogPageProps) {
  return (
    <WithQueryClient>
      <CatalogScreen {...props} />
    </WithQueryClient>
  );
}
