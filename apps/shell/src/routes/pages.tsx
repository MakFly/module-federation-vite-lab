import { isRouteErrorResponse, Link, useParams, useRouteError } from 'react-router';
import { RotateCw } from 'lucide-react';
import { paths } from '@acme/bff-client';
import { defaultCountry, isCountry } from '../lib/countries';

function useHome() {
  const { country } = useParams();
  return paths.home(isCountry(country) ? country : defaultCountry);
}

export function NotFound() {
  const home = useHome();
  return (
    <div className="mx-auto flex max-w-[640px] flex-col items-center px-5 py-32 text-center">
      <title>Page introuvable. Calque.</title>
      <h1 className="text-[2.5rem] font-semibold tracking-[-0.03em]">Cette page n’existe pas.</h1>
      <Link to={home} className="mt-6 text-link hover:underline">Revenir à l’accueil</Link>
    </div>
  );
}

// Shown in the page area while the first navigation's loaders run (the nav is already there).
export function PageSkeleton() {
  return <div role="status" aria-label="Chargement" className="mx-3 mt-3 h-[80svh] rounded-[28px] bg-background motion-safe:animate-pulse" />;
}

/**
 * The shell's boundary for everything under /:country. The catalog handles its own data errors;
 * what lands here is an unknown country, or the remote itself failing to load (manifest or
 * `catalog/routes` unreachable). It renders inside the layout: nav, search and bag keep working.
 */
export function PageError() {
  const error = useRouteError();
  if (isRouteErrorResponse(error) && error.status === 404) return <NotFound />;
  console.error('Route error', error);

  return (
    <section role="alert" className="mx-auto flex max-w-[640px] flex-col items-center gap-4 px-5 py-28 text-center">
      <title>Boutique indisponible. Calque.</title>
      <h1 className="text-[2.5rem] font-semibold tracking-[-0.03em] text-balance">Le catalogue n’a pas pu être chargé.</h1>
      <p className="max-w-[52ch] text-lg leading-relaxed text-muted-foreground">
        Le remote catalog servi par :3001 ne répond pas. La recherche et ton sac restent utilisables : ils appartiennent au shell.
      </p>
      {/* A full reload: a failed remote entry is not retried by the federation runtime. */}
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-[15px] font-medium text-primary-foreground"
      >
        <RotateCw aria-hidden="true" className="size-4" /> Recharger la page
      </button>
    </section>
  );
}
