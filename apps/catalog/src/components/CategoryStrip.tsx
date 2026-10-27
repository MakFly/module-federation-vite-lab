import { useQuery } from '@tanstack/react-query';
import { NavLink } from 'react-router';
import type { CatalogProductView } from '@acme/contracts';
import { catalogPageQuery, paths } from '@acme/bff-client';
import { DeviceArt } from '@acme/ui/components/device-art';
import { cn } from '@acme/ui/lib/utils';
import { useCountry } from '../lib/country';

// The strip sits on #f5f5f7: draw each thumbnail in its darkest finish so a white stylus stays visible.
const luminance = (hex: string) => [1, 3, 5].reduce((sum, index, channel) => sum + parseInt(hex.slice(index, index + 2), 16) * [0.2126, 0.7152, 0.0722][channel]!, 0);
const darkestFinish = (product: CatalogProductView) =>
  product.finishes.reduce((darkest, finish) => (luminance(finish.hex) < luminance(darkest.hex) ? finish : darkest)).hex;

export function CategoryStrip() {
  const country = useCountry();
  // Always the unfiltered catalog (shared cache with the home page), so every category has its picture.
  const { data: view } = useQuery(catalogPageQuery(country));
  if (!view) return null;
  return (
    <nav aria-label="Catégories" className="overflow-x-auto [scrollbar-width:none]">
      <ul className="mx-auto flex w-max gap-2 px-5 sm:gap-6">
        {view.categories.map((category) => {
          const sample = view.products.find((product) => product.category.slug === category.slug);
          return (
            <li key={category.slug}>
              {/* NavLink sets aria-current="page" on the category being shown. */}
              <NavLink to={paths.category(country, category.slug)} className="group flex w-24 flex-col items-center gap-2 rounded-xl px-1 py-2 text-center sm:w-28">
                {({ isActive }) => (
                  <>
                    <span className="flex h-14 w-20 items-end justify-center">
                      {sample && <DeviceArt formFactor={sample.formFactor} finish={darkestFinish(sample)} className="max-h-14 w-auto transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-0.5" />}
                    </span>
                    <span className={cn('text-[13px] leading-tight', isActive ? 'font-semibold text-foreground' : 'text-foreground/80 group-hover:text-foreground')}>
                      {category.name}
                    </span>
                  </>
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
