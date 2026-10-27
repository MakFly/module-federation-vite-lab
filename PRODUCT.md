# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Deux publics, confirmés par l'utilisateur :

- Le développeur qui étudie ce lab : il veut comprendre Module Federation, un BFF et une API DDD en voyant une vraie boutique fonctionner, et repérer qui possède chaque partie de la page.
- Le visiteur fictif de la boutique : il parcourt le catalogue d'une marque d'électronique, choisit une finition et ajoute au sac, sur ordinateur ou téléphone.

## Product Purpose

Une boutique en ligne de démonstration, de style Apple, pour une marque tech fictive nommée Calque. Elle existe pour rendre l'architecture micro-frontend tangible : le shell (hôte) possède la navigation, la recherche, le sac et le routage ; le remote catalog possède l'accueil, les pages catégorie et les fiches produit. Réussite : la boutique se comporte comme un vrai site e-commerce, sur mobile comme sur desktop, et l'on peut voir les frontières entre micro-frontends.

## Positioning

Ce n'est pas un template e-commerce : chaque zone de la page appartient à un déploiement identifiable (shell :3000, catalog :3001, BFF :3003, API :3002), et l'interface peut afficher ces frontières à la demande.

## Operating Context

- Lab local, lancé avec `bun run dev` ; données en mémoire.
- Deux pays (anciens tenants) : France (`fr`) et Belgique (`be`), chacun avec son catalogue, ses prix, ses stocks et son sac.
- Le sac est conservé côté serveur et lié à un cookie de session httpOnly posé par le BFF.

## Capabilities and Constraints

- Accueil, pages catégorie, fiche produit sur sa propre URL, recherche plein écran, sac (ajout par finition, retrait, vidage).
- Règles métier venant de l'API : 5 maximum par ligne, stock limité, produits épuisés, prix figé au premier ajout.
- React 19, Vite, Module Federation, Tailwind 4, shadcn/ui (Radix), TanStack Query. Pas de `useEffect` (règle ESLint).
- Pas de paiement ni de commande : le parcours s'arrête au sac.

## Brand Commitments

- Style visuel imposé par l'utilisateur : boutique « type Apple », avec une recherche à la manière d'Apple.
- Nom de marque fictif : Calque. Ni le nom, ni le logo, ni les produits d'Apple ne sont reproduits.
- Langue : français, tutoiement.

## Evidence on Hand

- Aucune photo produit : les visuels sont dessinés en SVG à partir de la forme de l'appareil et de sa finition.
- Produits, prix, stocks et caractéristiques sont fictifs et doivent être signalés comme tels ; aucun avis client, chiffre de vente, délai de livraison ou garantie n'existe et ne doit être inventé.

## Product Principles

1. La boutique doit fonctionner pour de vrai : chaque bouton visible fait quelque chose, chaque règle métier remonte à l'écran.
2. L'architecture se lit dans le produit : qui possède quoi est montrable, jamais caché.
3. Mobile et desktop sont tous deux des cibles de premier rang.
4. Ne rien prétendre qui ne soit dans les données.

## Accessibility & Inclusion

WCAG 2.1 AA : contraste, navigation clavier complète (recherche, sac, menu mobile), focus visible, respect de `prefers-reduced-motion`.
