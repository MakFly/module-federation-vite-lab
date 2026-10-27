import { lazy, Suspense, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import type { AddToBagRequest } from '@acme/contracts';
import { createQueryClient } from '@acme/bff-client';
import './standalone.css';

const CatalogPage = lazy(() => import('./CatalogPage'));
const ProductPage = lazy(() => import('./ProductPage'));
const queryClient = createQueryClient();

// Standalone mode: the catalog team develops its two exposed pages without the shell.
// No client router here: links reload the page, and the path picks the page once.
function Standalone() {
  const [lastAdded, setLastAdded] = useState<AddToBagRequest | null>(null);
  const [, section, id] = location.pathname.split('/');

  return (
    <>
      <p className="bg-tile-dark px-5 py-2.5 text-center text-xs text-tile-dark-foreground">
        Remote catalog seul, sans le shell. {lastAdded
          ? `Ajout reçu par l’hôte de test : ${lastAdded.product.name}, ${lastAdded.product.finishes.find((finish) => finish.id === lastAdded.finishId)?.name}.`
          : 'Pas de sac ici : les ajouts sont seulement affichés.'}
      </p>
      <Suspense fallback={<p role="status" className="p-10 text-center text-muted-foreground">Chargement…</p>}>
        {section === 'produit' && id
          ? <ProductPage tenantId="fr" productId={id} onAddToBag={setLastAdded} />
          : <CatalogPage tenantId="fr" categorySlug={section === 'boutique' ? id : undefined} onAddToBag={setLastAdded} />}
      </Suspense>
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <Standalone />
  </QueryClientProvider>,
);
