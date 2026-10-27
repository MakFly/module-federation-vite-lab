import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog } from 'radix-ui';
import { ArrowRight, Search, X } from 'lucide-react';
import type { CatalogProductView } from '@acme/contracts';
import { catalogPageQuery, paths } from '@acme/bff-client';
import { DeviceArt } from '@acme/ui/components/device-art';
import { useDebouncedCallback } from '@acme/ui/lib/use-debounced-callback';
import { navigate } from './router';

type Props = { tenantId: string; open: boolean; onOpenChange: (open: boolean) => void };

function Highlight({ text, term }: { text: string; term: string }) {
  const index = term ? text.toLocaleLowerCase('fr').indexOf(term.toLocaleLowerCase('fr')) : -1;
  if (index < 0) return <>{text}</>;
  return <>{text.slice(0, index)}<mark className="bg-transparent font-semibold text-foreground">{text.slice(index, index + term.length)}</mark>{text.slice(index + term.length)}</>;
}

// Apple-style search: the panel drops from the nav, the page blurs behind it, results arrive as you type.
export function SearchPanel({ tenantId, open, onOpenChange }: Props) {
  const [input, setInput] = useState('');
  const [term, setTerm] = useState('');
  const debounced = useDebouncedCallback(setTerm, 200);

  const catalog = useQuery(catalogPageQuery(tenantId));
  const results = useQuery({ ...catalogPageQuery(tenantId, { search: term }), enabled: term.length > 0 });
  const products: CatalogProductView[] = term ? results.data?.products ?? [] : [];

  const close = () => onOpenChange(false);
  const reset = () => { debounced.cancel(); setInput(''); setTerm(''); };

  return (
    <Dialog.Root open={open} onOpenChange={(next) => { onOpenChange(next); if (!next) reset(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 top-11 z-40 bg-black/25 backdrop-blur-md data-[state=open]:motion-safe:animate-in data-[state=open]:motion-safe:fade-in data-[state=closed]:motion-safe:animate-out data-[state=closed]:motion-safe:fade-out" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 top-0 z-50 max-h-svh overflow-y-auto bg-background pt-11 shadow-flyout outline-none data-[state=open]:motion-safe:animate-in data-[state=open]:motion-safe:slide-in-from-top-4 data-[state=open]:motion-safe:fade-in data-[state=open]:motion-safe:duration-300 data-[state=closed]:motion-safe:animate-out data-[state=closed]:motion-safe:fade-out"
        >
          <Dialog.Title className="sr-only">Rechercher dans la boutique</Dialog.Title>
          {/* The panel covers the nav strip: its close button sits where the search icon was. */}
          <div className="absolute inset-x-0 top-0 mx-auto flex h-11 max-w-[1024px] justify-end px-2 sm:px-4">
            <Dialog.Close aria-label="Fermer la recherche" className="flex size-11 items-center justify-center text-foreground/70 hover:text-foreground">
              <X aria-hidden="true" className="size-[18px]" strokeWidth={1.6} />
            </Dialog.Close>
          </div>
          <div className="mx-auto max-w-[680px] px-6 pt-6 pb-14 sm:pt-10">
            <form
              role="search"
              className="flex items-center gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                const first = products[0];
                if (first) { close(); navigate(paths.product(first.id)); }
              }}
            >
              <Search aria-hidden="true" className="size-6 shrink-0 text-muted-foreground" />
              <input
                autoFocus
                type="search"
                value={input}
                onChange={(event) => { setInput(event.target.value); debounced.run(event.target.value.trim()); }}
                placeholder="Rechercher dans la boutique"
                aria-label="Rechercher dans la boutique"
                className="min-w-0 flex-1 bg-transparent text-2xl font-semibold tracking-[-0.02em] outline-none placeholder:text-muted-foreground/70 focus-visible:outline-none [&::-webkit-search-cancel-button]:hidden"
              />
              {input && (
                <button type="button" onClick={reset} aria-label="Effacer la recherche" className="rounded-full p-1 text-muted-foreground hover:text-foreground">
                  <X aria-hidden="true" className="size-5" />
                </button>
              )}
            </form>

            <div className="mt-8" aria-live="polite">
              {!term ? (
                <>
                  <h2 className="text-xs text-muted-foreground">Liens rapides</h2>
                  <ul className="mt-3 space-y-1">
                    {(catalog.data?.categories ?? []).map((category) => (
                      <li key={category.slug}>
                        <a href={paths.category(category.slug)} onClick={close} className="group flex items-center gap-3 rounded-md py-1.5 text-sm font-semibold">
                          <ArrowRight aria-hidden="true" className="size-3.5 text-muted-foreground group-hover:text-foreground" />
                          {category.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </>
              ) : products.length > 0 ? (
                <>
                  <h2 className="text-xs text-muted-foreground">Produits</h2>
                  <ul className="mt-3 divide-y">
                    {products.map((product) => (
                      <li key={product.id}>
                        <a href={paths.product(product.id)} onClick={close} className="flex items-center gap-4 rounded-md py-3 hover:bg-muted/60 sm:-mx-3 sm:px-3">
                          <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted p-1.5">
                            <DeviceArt formFactor={product.formFactor} finish={product.finishes[0]!.hex} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[15px]"><Highlight text={product.name} term={term} /></span>
                            <span className="block text-xs text-muted-foreground">{product.category.name}</span>
                          </span>
                          <span className="text-sm text-muted-foreground">{product.price.formatted}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </>
              ) : results.isFetching ? (
                <p role="status" className="text-sm text-muted-foreground">Recherche…</p>
              ) : results.isError ? (
                <p role="alert" className="text-sm text-destructive">La recherche ne répond pas. {results.error.message}</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Aucun produit ne correspond à « {term} ». Essaie un nom de produit, comme Ardoise ou Écho.
                </p>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
