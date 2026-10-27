// React entry points spelled out to make the sharing policy readable.
// Same version contract in the shell and the catalog.
const reactVersion = '19.3.1';

export const sharedReact = {
  react: { singleton: true, requiredVersion: reactVersion },
  'react/jsx-runtime': { singleton: true, requiredVersion: reactVersion },
  'react/jsx-dev-runtime': { singleton: true, requiredVersion: reactVersion },
  'react-dom': { singleton: true, requiredVersion: reactVersion },
  'react-dom/client': { singleton: true, requiredVersion: reactVersion },
  // Singleton required: the remote must read the same QueryClientContext as the shell,
  // otherwise it does not see the host's QueryClientProvider (and the cache is not shared).
  '@tanstack/react-query': { singleton: true, requiredVersion: '5.105.0' },
};
