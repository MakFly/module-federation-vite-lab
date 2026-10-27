import { lazy, Suspense, useState } from 'react';
import { SquareDashed } from 'lucide-react';
import type { AddToBagRequest } from '@acme/contracts';
import { paths } from '@acme/bff-client';
import { cn } from '@acme/ui/lib/utils';
import { countries, Footer } from './Footer';
import { GlobalNav } from './GlobalNav';
import MfeZone from './MfeZone';
import RemoteBoundary from './RemoteBoundary';
import { interceptLinks, matchRoute, navigate, usePathname } from './router';
import { useCart } from './useCart';

// Two pages exposed by the same remote: loaded on demand, from :3001.
const CatalogPage = lazy(() => import('catalog/CatalogPage'));
const ProductPage = lazy(() => import('catalog/ProductPage'));

const readCountry = () => {
  try {
    const saved = localStorage.getItem('country');
    return countries.some((country) => country.id === saved) ? saved! : 'fr';
  } catch {
    return 'fr';
  }
};

function NotFound() {
  return (
    <div className="mx-auto flex max-w-[640px] flex-col items-center px-5 py-32 text-center">
      <title>Page introuvable. Calque.</title>
      <h1 className="text-[2.5rem] font-semibold tracking-[-0.03em]">Cette page n’existe pas.</h1>
      <a href={paths.home} className="mt-6 text-link hover:underline">Revenir à l’accueil</a>
    </div>
  );
}

export default function App() {
  const [tenantId, setTenantId] = useState(readCountry);
  const [showZones, setShowZones] = useState(false);
  const route = matchRoute(usePathname());
  const cart = useCart(tenantId);

  const addToBag = ({ product, finishId }: AddToBagRequest) => cart.add(product.id, finishId);

  // Changing country is an event: persist it and reset what belonged to the previous one, right here.
  const changeCountry = (next: string) => {
    setTenantId(next);
    cart.resetActionError();
    cart.setOpen(false);
    try { localStorage.setItem('country', next); } catch { /* storage unavailable: country not remembered */ }
    if (route.name === 'product') navigate(paths.home);
  };

  const page = (() => {
    switch (route.name) {
      case 'home': return <CatalogPage tenantId={tenantId} onAddToBag={addToBag} />;
      case 'category': return <CatalogPage tenantId={tenantId} categorySlug={route.slug} onAddToBag={addToBag} />;
      case 'product': return <ProductPage key={route.id} tenantId={tenantId} productId={route.id} onAddToBag={addToBag} />;
      case 'notFound': return null;
    }
  })();

  return (
    // Click delegation: links rendered by the remote become client navigations here.
    <div onClick={interceptLinks} className="flex min-h-svh flex-col">
      <MfeZone show={showZones} inset label="Shell, hôte :3000 (navigation, recherche, sac)" className="sticky top-0 z-50">
        <GlobalNav tenantId={tenantId} currentCategory={route.name === 'category' ? route.slug : undefined} cart={cart} />
      </MfeZone>

      {/* Painted like the footer: on a short page or a tall screen, no white band between two grey grounds. */}
      <main className="flex-1 bg-muted">
        {route.name === 'notFound' ? <NotFound /> : (
          <MfeZone show={showZones} inset label={`Remote catalog :3001 (${route.name === 'product' ? 'ProductPage' : 'CatalogPage'})`}>
            <RemoteBoundary key={`${tenantId}-${route.name}`}>
              <Suspense fallback={<div role="status" aria-label="Chargement" className="mx-3 mt-3 h-[80svh] rounded-[28px] bg-background motion-safe:animate-pulse" />}>
                {page}
              </Suspense>
            </RemoteBoundary>
          </MfeZone>
        )}
      </main>

      <MfeZone show={showZones} inset label="Shell :3000 (pied de page, pays)">
        <Footer tenantId={tenantId} onCountryChange={changeCountry} zonesShown={showZones} onToggleZones={() => setShowZones((value) => !value)} />
      </MfeZone>

      {/* Lab tool, not part of the store: shows which deployment owns each zone. */}
      <button
        type="button"
        aria-pressed={showZones}
        onClick={() => setShowZones((value) => !value)}
        className={cn(
          // Hidden on phones, where it would cover content; the footer carries the same toggle.
          'fixed bottom-4 left-4 z-40 hidden h-9 items-center sm:inline-flex gap-2 rounded-full px-3.5 text-xs font-medium shadow-flyout transition-colors',
          showZones ? 'bg-primary text-primary-foreground' : 'bg-white/90 text-foreground backdrop-blur hover:bg-white',
        )}
      >
        <SquareDashed aria-hidden="true" className="size-4" />
        Micro-frontends
      </button>
    </div>
  );
}
