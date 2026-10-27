import { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router';
import { createQueryClient } from '@acme/bff-client';
import { createShellRouter } from './router';
import './shell.css';

// The host owns the QueryClient and the router. The catalog remote runs under both
// (react-query and react-router are shared singletons): one cache, one history for the page.
const queryClient = createQueryClient();
const router = createShellRouter(queryClient);

const Devtools = import.meta.env.DEV
  ? lazy(() => import('@tanstack/react-query-devtools').then((module) => ({ default: module.ReactQueryDevtools })))
  : () => null;

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
    <Suspense><Devtools buttonPosition="bottom-right" /></Suspense>
  </QueryClientProvider>,
);
