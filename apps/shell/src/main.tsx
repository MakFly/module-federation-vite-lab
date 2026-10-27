import { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { createQueryClient } from '@acme/bff-client';
import App from './App';
import './shell.css';

// The host owns the QueryClient. The catalog remote runs under this provider
// (react-query is shared as a singleton): a single cache for the whole page.
const queryClient = createQueryClient();

const Devtools = import.meta.env.DEV
  ? lazy(() => import('@tanstack/react-query-devtools').then((module) => ({ default: module.ReactQueryDevtools })))
  : () => null;

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <App />
    <Suspense><Devtools buttonPosition="bottom-right" /></Suspense>
  </QueryClientProvider>,
);
