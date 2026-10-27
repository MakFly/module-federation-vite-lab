import { federation } from '@module-federation/vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import { sharedReact } from '../../federation.shared.ts';

const workspaceRoot = fileURLToPath(new URL('../..', import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, workspaceRoot, '');
  const bffProxy = { target: env.BFF_URL || 'http://localhost:3003' };

  return {
    base: './',
    plugins: [
      react(),
      tailwindcss(),
      federation({
        name: 'shell',
        remotes: {
          catalog: {
            type: 'module',
            name: 'catalog',
            entry: env.CATALOG_REMOTE_URL || 'http://localhost:3001/mf-manifest.json',
          },
        },
        shared: sharedReact,
        // The catalog being unavailable does not block the shell's initialization.
        shareStrategy: 'loaded-first',
        manifest: true,
        dts: false,
      }),
    ],
    server: {
      host: 'localhost',
      port: 3000,
      strictPort: true,
      origin: 'http://localhost:3000',
      cors: { origin: ['http://localhost:3000'] },
      // The shell AND the catalog remote (which runs in this page) call /bff with a relative URL.
      proxy: { '/bff': bffProxy },
    },
    preview: {
      host: 'localhost',
      port: 3000,
      strictPort: true,
      proxy: { '/bff': bffProxy },
    },
    build: { target: 'es2022', sourcemap: true },
  };
});
