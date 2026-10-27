import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, Navigate, Outlet, RouterProvider, ScrollRestoration } from 'react-router';
import type { BagActionResult } from '@acme/contracts';
import { createQueryClient, paths } from '@acme/bff-client';
import { createCatalogRoutes } from './routes';
import './standalone.css';

const queryClient = createQueryClient();

// Standalone mode: the catalog team runs its exposed routes without the shell, under a minimal
// test host that provides what the contract expects: a `:country` route and a bag action.
function TestHost() {
  return (
    <>
      <p className="bg-tile-dark px-5 py-2.5 text-center text-xs text-tile-dark-foreground">
        Remote catalog seul, sans le shell. Pas de sac ici : l’action de test accepte les ajouts sans les enregistrer.
      </p>
      <Outlet />
      <ScrollRestoration />
    </>
  );
}

const router = createBrowserRouter([
  { index: true, element: <Navigate to={paths.home('fr')} replace /> },
  {
    path: ':country',
    Component: TestHost,
    HydrateFallback: () => <p role="status" className="p-10 text-center text-muted-foreground">Chargement…</p>,
    children: [
      {
        path: 'sac',
        action: async ({ request }): Promise<BagActionResult> => {
          console.info('Bag action (test host):', Object.fromEntries(await request.formData()));
          return { ok: true };
        },
      },
      ...createCatalogRoutes({ queryClient }),
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
  </QueryClientProvider>,
);
