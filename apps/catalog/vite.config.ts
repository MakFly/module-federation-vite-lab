import { federation } from '@module-federation/vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { sharedReact } from '../../federation.shared.ts';

const bffProxy = { target: process.env.BFF_URL || 'http://localhost:3003' };

/**
 * Scopes the remote's utilities to its own subtree.
 * Host and remote each ship a Tailwind stylesheet; without scoping, the remote's `.hidden`
 * (loaded later) overrides the host's `md:flex` on the host's own elements.
 * Every selector of catalog.css becomes `[data-mfe="catalog"] <selector>`: it no longer reaches
 * the shell, and inside the remote it wins over the host's sheet whatever the load order.
 */
const scopeRemoteCss = {
  postcssPlugin: 'scope-remote-css',
  Once(root: import('postcss').Root, { result }: { result: import('postcss').Result }) {
    if (!result.opts.from?.replace(/\\/g, '/').endsWith('/src/catalog.css')) return;
    root.walkRules((rule) => {
      const parent = rule.parent;
      if (parent?.type === 'atrule' && /keyframes$/i.test((parent as import('postcss').AtRule).name)) return;
      rule.selectors = rule.selectors.map((selector) =>
        /^(:root|:host|html|body)\b/.test(selector) ? selector : `[data-mfe="catalog"] ${selector}`,
      );
    });
  },
};

export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    federation({
      name: 'catalog',
      filename: 'remoteEntry.js',
      // One module: the route tree the remote owns (its pages are lazy chunks behind it).
      exposes: {
        './routes': './src/routes.tsx',
      },
      shared: sharedReact,
      shareStrategy: 'loaded-first',
      manifest: true,
      dts: false,
      // The manifest describes the expose's CSS without bundling the standalone one.
      bundleAllCSS: false,
    }),
  ],
  server: {
    host: 'localhost',
    port: 3001,
    strictPort: true,
    origin: 'http://localhost:3001',
    cors: { origin: ['http://localhost:3000'] },
    // Standalone, the catalog talks to the BFF through the same origin (first-party cookie, no CORS).
    proxy: { '/bff': bffProxy },
  },
  preview: {
    host: 'localhost',
    port: 3001,
    strictPort: true,
    cors: { origin: ['http://localhost:3000'] },
    proxy: { '/bff': bffProxy },
  },
  css: { postcss: { plugins: [scopeRemoteCss] } },
  build: { target: 'es2022', sourcemap: true },
});
