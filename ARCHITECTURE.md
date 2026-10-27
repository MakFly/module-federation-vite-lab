# Architecture du POC

```
 Navigateur
 ┌───────────────────────────────────────────────┐
 │ shell :3000  (host Module Federation)         │
 │  ├─ routeur React Router, nav, recherche, sac │
 │  └─ routes du catalog ← chargées depuis :3001 │
 └──────────────┬────────────────────────────────┘
                │ fetch('/bff/...')  même origine, cookie httpOnly
                ▼
   proxy Vite (dev) / reverse proxy (prod)
                │
                ▼
 ┌───────────────────────────┐   HTTP + X-Request-Id   ┌──────────────────────────────┐
 │ BFF :3003  (Hono)         │ ──────────────────────▶ │ API :3002  (Hono, DDD)       │
 │ session, agrégation,      │                         │ contextes catalog + cart     │
 │ formatage, erreurs amont  │ ◀────────────────────── │ règles métier, persistance   │
 └───────────────────────────┘    ApiEnvelope<T>       └──────────────────────────────┘
```

| Brique | Rôle | Ne fait pas |
|---|---|---|
| `apps/shell` | Possède le routeur (React Router), le layout, la navigation, la recherche, le sac et son action. | Ne connaît ni l'API ni les pages du catalogue. |
| `apps/catalog` | Remote fédéré, un module exposé (`catalog/routes`) : ses routes sous `/:country`, leurs loaders et leurs erreurs. | Ne connaît ni le panier ni l'API. |
| `apps/bff` | Porte d'entrée unique des fronts : session, agrégation, vues prêtes à afficher. | Aucune règle métier. |
| `apps/api` | Le métier : entités, invariants, cas d'usage. | Aucun formatage d'écran, pas de CORS (interne). |
| `packages/contracts` | Types partagés : enveloppe HTTP, DTO API, vues BFF, props du remote. | Aucun code exécuté. |
| `packages/bff-client` | `fetch` typé côté navigateur, lit l'enveloppe et lève `BffRequestError`. | |

## Côté front : React Router, le remote possède ses routes

```
/                      → redirige vers /fr                      (shell)
/:country              → layout du shell, pays validé (fr | be) (shell)
  ├─ sac               → action du sac (POST), pas de page      (shell)
  ├─ *                 → 404                                    (shell)
  └─ [patché au runtime depuis catalog/routes]                  (remote)
     ├─ (index)        → HomePage
     ├─ boutique/:slug → CategoryPage
     └─ produit/:id    → ProductPage
```

- **React Router 7 en mode data** (`createBrowserRouter`). `react-router` est partagé en **singleton**, comme React et TanStack Query : les `<Link>`, `useParams()` et `useFetcher()` du remote lisent le contexte du routeur du shell. Avec deux copies, le remote planterait (« useHref() may be used only in the context of a <Router> »).
- **Le remote expose ses routes, pas ses pages.** `catalog/routes` exporte `createCatalogRoutes({ queryClient })`, qui renvoie un arbre de routes. Le shell ne liste aucune page du catalogue.
- **Découverte paresseuse.** `patchRoutesOnNavigation` (dans `apps/shell/src/router.tsx`) charge `catalog/routes` via Module Federation à la première navigation qui en a besoin, puis le greffe sous la route `country`. Si le remote est indisponible, l'import échoue, `PageError` s'affiche dans le layout (nav, recherche et sac restent utilisables), et la navigation suivante réessaie.
- **Loaders + TanStack Query.** Chaque route du remote a un loader `queryClient.ensureQueryData(...)` : les données sont dans le cache avant le rendu, la page précédente reste affichée avec une barre de progression (`useNavigation`). Les pages lisent le cache avec `useSuspenseQuery`. Chaque page est un chunk séparé (`lazy`).
- **Le contrat du sac est une URL.** Le remote ne reçoit plus de callback : il poste une `CartAction` sur `/:country/sac` avec un `useFetcher` (clé partagée par produit, donc « Ajout… » sur tous les boutons du même produit). L'action du shell appelle le BFF, écrit le panier dans le cache et ouvre le sac (store externe lu par `useSyncExternalStore`).
- **Erreurs par propriétaire.** Les erreurs des loaders du catalogue (produit non vendu en Belgique, BFF en panne) restent dans le remote (`CatalogError`). Les erreurs du shell (pays inconnu, remote injoignable) sont gérées par `PageError`.
- **Qui affiche quoi.** Chaque route de page porte un `handle: { mfe, page }`. Le bouton « Micro-frontends » lit `useMatches()` pour étiqueter la zone.
- `@tanstack/react-query` reste partagé : une seule `QueryClient`, créée par le shell et passée au remote (loaders) et au `QueryClientProvider` (composants). Les requêtes sont définies une fois dans `packages/bff-client/src/queries.ts`, avec le schéma d'URL (`paths`).
- Règle suivie (react.dev, « You Might Not Need an Effect ») :

  | Besoin | Outil | Pas |
  |---|---|---|
  | Données serveur | `useQuery` / `useMutation` | `useEffect` + `fetch` + `useState` |
  | Réagir à une action (taper, changer de site) | le gestionnaire d'événement (`onChange`, `onClick`) | un effet qui observe une valeur |
  | Valeur calculée (Set des produits en cours d'ajout, pluriels…) | calcul pendant le rendu | `useState` + effet de synchronisation |
  | URL, navigation, mutations | React Router (loaders, actions, fetchers) | `useState` recopié puis resynchronisé |
  | État externe hors React (sac ouvert par l'action) | `useSyncExternalStore` | un effet qui observe une valeur |

  Il n'y a plus aucun `useEffect` dans `apps/` ni `packages/`. Le debounce de la recherche est déclenché par la frappe (`useDebouncedCallback`), et le changement de pays (sac, erreur, page) est traité dans le `onChange` du sélecteur de pays.

## Le parcours « Ajouter au panier »

1. **catalog** (remote) : choix d'une finition puis clic → `fetcher.submit({ type: 'add', productId, finishId }, { method: 'post', action: '/fr/sac' })`.
2. **shell** : l'action de la route `/:country/sac` → `POST /bff/cart/items?tenant=fr { productId, finishId }`.
3. **BFF** `session.middleware` lit le cookie `bff_sid` → `withCart()` retrouve (ou crée) l'id de panier API de cette session.
4. **BFF** `CatalogApiClient` → `POST /api/v1/tenants/fr/carts/:id/items`, avec le même `X-Request-Id`.
5. **API** handler → `validate` (Zod : forme de la requête) → use case `AddItemToCart` → `Cart.addItem()` (domaine : stock, max par ligne, prix figé) → `CartRepository.save()`.
6. Réponse `ApiEnvelope<CartDto>` → le BFF la transforme en `CartView` (prix formatés, id interne retiré) → l'action l'écrit dans le cache et ouvre le sac.

Si le domaine refuse (`INSUFFICIENT_STOCK`), l'erreur remonte sans perdre son code : `BusinessRuleViolation` → 422 côté API → relayée par le BFF → `BffRequestError` → l'action ouvre le sac avec le message.

## L'API en DDD

```
apps/api/src/
├─ index.ts                     démarrage
├─ app.ts                       middlewares + montage des routes
├─ container.ts                 composition root : choisit les implémentations
├─ shared/
│  ├─ domain/                   errors.ts (DomainError…), money.ts (value object), page.ts
│  └─ http/                     apiResponse.ts, errorHandler.ts, validate.ts, env.ts
└─ modules/
   ├─ catalog/                  contexte « catalogue »
   │  ├─ domain/                Product (entité), ProductRepository (port)
   │  ├─ application/           ListProducts, GetProduct, ListCategories
   │  ├─ infrastructure/        InMemoryProductRepository, seed
   │  └─ http/                  schemas, mapper, handlers/, routes
   └─ cart/                     contexte « panier »
      ├─ domain/                Cart (agrégat), CartLine, ProductSnapshot, CartRepository
      ├─ application/           use cases + CatalogPort (port sortant)
      ├─ infrastructure/        InMemoryCartRepository, InProcessCatalogAdapter (anti-corruption)
      └─ http/                  schemas, mapper, handlers/, routes
```

Les dépendances vont toujours vers l'intérieur : `http → application → domain`, et `infrastructure` implémente les ports du domaine. Le domaine n'importe ni Hono, ni Zod, ni rien d'HTTP.

Les erreurs suivent un seul chemin :

| Levée par | Classe | HTTP |
|---|---|---|
| Domaine / use case | `ValidationError` | 400 |
| | `NotFoundError` | 404 |
| | `ConflictError` | 409 |
| | `BusinessRuleViolation` | 422 |
| Hono (JSON invalide, timeout…) | `HTTPException` | son statut |
| Tout le reste | — | 500, message générique, trace dans les logs |

La table de correspondance vit uniquement dans `shared/http/errorHandler.ts`.

Format de réponse (`shared/http/apiResponse.ts`, type `ApiEnvelope<T>`) :

```jsonc
// succès
{ "success": true, "data": { ... }, "meta": { "requestId": "…", "timestamp": "…", "pagination": { "page": 1, "pageSize": 20, "total": 6, "totalPages": 1 } } }
// échec
{ "success": false, "error": { "code": "INSUFFICIENT_STOCK", "message": "Plus que 2 « Casque studio » en stock", "details": [] }, "meta": { "requestId": "…", "timestamp": "…" } }
```

## Migrer un legacy avec cette archi

- **Remplacer la source des produits** (vieille API, autre langage) : écrire `LegacyProductRepository implements ProductRepository` dans `catalog/infrastructure/`, puis changer une ligne dans `container.ts`.
- **Sortir le catalogue dans un service séparé** : remplacer `InProcessCatalogAdapter` par un adapter HTTP qui implémente `CatalogPort`. Le panier ne voit pas la différence.
- **Réécrire l'API complète** dans un autre langage : le BFF ne dépend que du contrat `ApiEnvelope` + DTO. On bascule endpoint par endpoint dans `CatalogApiClient` (strangler fig), sans redéployer les fronts.

## Lancer

```bash
bun install
bun run dev        # api :3002, bff :3003, catalog :3001, shell :3000
bun run test       # domaine + HTTP API, intégration BFF -> API
bun run typecheck
```

## Ce qu'il manque pour la production

Ce POC garde volontairement tout en mémoire, sans authentification. Pour aller en production, il faudrait :

- **Persistance** : une vraie base (SQL) et un store de sessions partagé (Redis), avec expiration.
- **Auth** : OIDC géré par le BFF (les tokens restent côté serveur) et un jeton de service entre le BFF et l'API.
- **Panier** : réservation de stock transactionnelle, et événements de domaine (`ItemAddedToCart`) si d'autres contextes doivent réagir.
- **Observabilité** : OpenTelemetry (le `X-Request-Id` est déjà propagé), un retry avec backoff sur les GET du BFF, un circuit breaker.

## CSS : isoler le remote

Le shell et le remote livrent chacun leur feuille Tailwind. Sans isolation, la feuille du remote (chargée après) redéfinit des classes du shell : son `.hidden` masquait les liens `md:flex` de la navigation du shell. Le plugin PostCSS de `apps/catalog/vite.config.ts` préfixe chaque sélecteur de `catalog.css` par `[data-mfe="catalog"]`, l'attribut posé sur la racine des pages exposées : la CSS du remote ne touche plus le shell, et l'emporte dans son propre sous-arbre quel que soit l'ordre de chargement.
