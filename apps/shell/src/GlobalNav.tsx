import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog } from 'radix-ui';
import { Menu, Search, X } from 'lucide-react';
import { catalogPageQuery, paths } from '@acme/bff-client';
import { cn } from '@acme/ui/lib/utils';
import { BagFlyout } from './BagFlyout';
import { SearchPanel } from './SearchPanel';
import type { CartState } from './useCart';

// Two offset layers: a "calque" is a sheet of tracing paper laid over another.
export function CalqueMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className={className}>
      <rect x="1" y="1" width="12" height="12" rx="3.5" fill="currentColor" />
      <rect x="7" y="7" width="12" height="12" rx="3.5" fill="currentColor" fillOpacity="0.35" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

const iconButton = 'flex size-11 items-center justify-center text-foreground/80 transition-colors hover:text-foreground';

export function GlobalNav({ tenantId, currentCategory, cart }: { tenantId: string; currentCategory?: string; cart: CartState }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // Shared cache with the catalog remote's home page: no extra request.
  const categories = useQuery(catalogPageQuery(tenantId)).data?.categories ?? [];

  return (
    <header className="sticky top-0 z-50 h-11 bg-[rgb(250_250_252/0.8)] backdrop-blur-xl backdrop-saturate-[1.8]">
      <nav aria-label="Navigation principale" className="mx-auto flex h-full max-w-[1024px] items-center justify-between px-2 sm:px-4">
        <a href={paths.home} aria-label="Calque, accueil" className="flex size-11 items-center justify-center text-foreground/90 hover:text-foreground">
          <CalqueMark className="size-[18px]" />
        </a>

        <ul className="hidden flex-1 items-center justify-evenly px-6 md:flex">
          {categories.map((category) => (
            <li key={category.slug}>
              <a
                href={paths.category(category.slug)}
                aria-current={category.slug === currentCategory ? 'page' : undefined}
                className={cn('px-2 text-xs transition-colors hover:text-foreground', category.slug === currentCategory ? 'text-foreground' : 'text-foreground/80')}
              >
                {category.name}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center">
          <button type="button" aria-label="Rechercher dans la boutique" onClick={() => setSearchOpen(true)} className={iconButton}>
            <Search aria-hidden="true" className="size-[17px]" strokeWidth={1.6} />
          </button>
          <BagFlyout state={cart} />
          <button type="button" aria-label="Menu" onClick={() => setMenuOpen(true)} className={cn(iconButton, 'md:hidden')}>
            <Menu aria-hidden="true" className="size-[18px]" strokeWidth={1.6} />
          </button>
        </div>
      </nav>

      <SearchPanel tenantId={tenantId} open={searchOpen} onOpenChange={setSearchOpen} />

      {/* Mobile menu: categories in large type, Apple-style. */}
      <Dialog.Root open={menuOpen} onOpenChange={setMenuOpen}>
        <Dialog.Portal>
          <Dialog.Content
            aria-describedby={undefined}
            className="fixed inset-0 z-50 overflow-y-auto bg-background outline-none data-[state=open]:motion-safe:animate-in data-[state=open]:motion-safe:fade-in data-[state=open]:motion-safe:duration-200"
          >
            <div className="flex h-11 items-center justify-end px-2">
              <Dialog.Close aria-label="Fermer le menu" className={iconButton}>
                <X aria-hidden="true" className="size-5" strokeWidth={1.6} />
              </Dialog.Close>
            </div>
            <Dialog.Title className="sr-only">Menu</Dialog.Title>
            <ul className="space-y-1 px-12 pt-4 pb-12">
              {categories.map((category, index) => (
                <li
                  key={category.slug}
                  className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-1 motion-safe:fill-mode-both motion-safe:duration-300"
                  style={{ animationDelay: `${60 + index * 30}ms` }}
                >
                  <a href={paths.category(category.slug)} onClick={() => setMenuOpen(false)} className="block py-1.5 text-[28px] font-semibold tracking-[-0.02em]">
                    {category.name}
                  </a>
                </li>
              ))}
            </ul>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </header>
  );
}
