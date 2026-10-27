import type { ReactNode } from 'react';
import { Link, Outlet, useParams, useRevalidator, useRouteError } from 'react-router';
import { RotateCw } from 'lucide-react';
import { BffRequestError, paths } from '@acme/bff-client';
import { countryName } from './lib/country';

// The remote's stylesheet is scoped to this attribute (see vite.config.ts): keep it classless.
const Scope = ({ children }: { children: ReactNode }) => <div data-mfe="catalog">{children}</div>;

export function CatalogLayout() {
  return <Scope><Outlet /></Scope>;
}

// Errors of the catalog's own routes (a loader, a lazy chunk, a render) stay inside the remote:
// the shell's nav, search and bag keep working around it.
export function CatalogError() {
  const error = useRouteError();
  const { country = 'fr', id } = useParams();
  const revalidator = useRevalidator();
  const notFound = error instanceof BffRequestError && error.status === 404;
  const message = error instanceof Error ? error.message : 'Erreur inconnue.';

  const title = notFound
    ? id ? `Ce produit n’est pas vendu ${countryName[country] ?? 'ici'}.` : 'Cette page n’existe pas.'
    : 'La boutique ne répond pas.';

  return (
    <Scope>
      <title>{`${title} Calque.`}</title>
      <div role="alert" className="mx-auto flex max-w-[640px] flex-col items-center px-5 py-28 text-center">
        <h1 className="text-[2.5rem] font-semibold tracking-[-0.03em] text-balance">{title}</h1>
        <p className="mt-3 text-lg text-muted-foreground">{message}</p>
        {notFound ? (
          <Link to={paths.home(country)} className="mt-6 text-link hover:underline">Voir les produits disponibles</Link>
        ) : (
          <button
            type="button"
            disabled={revalidator.state === 'loading'}
            onClick={() => revalidator.revalidate()}
            className="mt-6 inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-[15px] font-medium text-primary-foreground disabled:opacity-60"
          >
            <RotateCw aria-hidden="true" className="size-4" /> Réessayer
          </button>
        )}
      </div>
    </Scope>
  );
}
