import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const effectMessage =
  'No useEffect in this project (see ARCHITECTURE.md, "Côté front"). ' +
  'Server data: useQuery/useMutation. Reacting to an action: the event handler. ' +
  'Derived value: compute during render. External state: useSyncExternalStore. ' +
  'Genuine sync with an external system: eslint-disable-next-line with the reason after "--".';

const frontend = ['apps/shell/src/**/*.{ts,tsx}', 'apps/catalog/src/**/*.{ts,tsx}', 'packages/ui/src/**/*.{ts,tsx}', 'packages/bff-client/src/**/*.ts'];

export default tseslint.config(
  { ignores: ['**/dist/**', '**/node_modules/**', '**/__mf__virtual/**', '**/.__mf__temp/**'] },

  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    linterOptions: { reportUnusedDisableDirectives: 'error' },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },

  // React frontends: recommended react-hooks rules (including set-state-in-effect) + ban on effects.
  {
    files: frontend,
    languageOptions: { globals: globals.browser },
    ...reactHooks.configs.flat.recommended,
    rules: {
      ...reactHooks.configs.flat.recommended.rules,
      // AST selectors rather than no-restricted-imports: `import * as React` (shadcn) stays allowed,
      // only effects imported by name or called via React.useEffect are flagged.
      'no-restricted-syntax': ['error',
        {
          selector: "ImportDeclaration[source.value='react'] > ImportSpecifier[imported.name=/^use(Layout)?Effect$/]",
          message: effectMessage,
        },
        {
          selector: "MemberExpression[object.name='React'][property.name=/^use(Layout)?Effect$/]",
          message: effectMessage,
        },
      ],
    },
  },

  // API, BFF, Vite configs: Bun / Node.
  {
    files: ['apps/api/**/*.ts', 'apps/bff/**/*.ts', '**/vite.config.ts', 'federation.shared.ts', 'eslint.config.js'],
    languageOptions: { globals: { ...globals.node, Bun: 'readonly' } },
  },
);
