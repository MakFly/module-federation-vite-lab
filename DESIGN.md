---
name: Calque
description: Boutique de démonstration type Apple pour une marque tech fictive, où chaque produit est la page.
colors:
  primary: "#0071e3"
  primary-foreground: "#ffffff"
  link: "#0066cc"
  link-on-dark: "#2997ff"
  signal: "#b64400"
  signal-on-dark: "#ff9f43"
  destructive: "#d70015"
  foreground: "#1d1d1f"
  muted-foreground: "#6e6e73"
  background: "#ffffff"
  muted: "#f5f5f7"
  secondary: "#e8e8ed"
  border: "#d2d2d7"
  nav-glass: "rgb(250 250 252 / 0.8)"
  tile-dark: "#000000"
  tile-dark-foreground: "#f5f5f7"
  tile-dark-muted: "#a1a1a6"
typography:
  display:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 6vw, 4.5rem)"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.03em"
  display-page:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 7vw, 4.5rem)"
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2rem, 5vw, 3.25rem)"
    fontWeight: 600
    lineHeight: 1.06
    letterSpacing: "-0.03em"
  headline-tile:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2rem, 4vw, 2.75rem)"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.333
    letterSpacing: "-0.02em"
  title-card:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.02em"
  lead:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.125rem, 2.2vw, 1.75rem)"
    fontWeight: 400
    lineHeight: 1.375
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.625
    letterSpacing: "-0.01em"
    fontFeature: "'ss01'"
  ui:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "-0.01em"
  caption:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.375
    letterSpacing: "-0.01em"
  label:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.333
    letterSpacing: "-0.01em"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "18px"
  stage: "28px"
  pill: "9999px"
spacing:
  gutter: "20px"
  tile-gap: "12px"
  shelf-gap: "20px"
  card: "24px"
  section: "80px"
  section-lg: "112px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.ui}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "40px"
  button-primary-large:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.pill}"
    height: "48px"
    width: "100%"
  button-primary-compact:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 12px"
    height: "28px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    typography: "{typography.ui}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "40px"
  button-secondary-hover:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
  button-secondary-on-dark:
    backgroundColor: "transparent"
    textColor: "{colors.link-on-dark}"
    rounded: "{rounded.pill}"
    height: "40px"
  button-secondary-on-dark-hover:
    backgroundColor: "{colors.link-on-dark}"
    textColor: "{colors.tile-dark}"
  hero-tile-light:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    padding: "48px 20px 0"
  hero-tile-grey:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.foreground}"
    padding: "40px 20px 0"
  hero-tile-dark:
    backgroundColor: "{colors.tile-dark}"
    textColor: "{colors.tile-dark-foreground}"
    padding: "48px 20px 0"
  product-card:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.xl}"
    padding: "{spacing.card}"
  product-stage:
    backgroundColor: "{colors.muted}"
    rounded: "{rounded.stage}"
    padding: "8%"
  finish-swatch:
    rounded: "{rounded.pill}"
    size: "28px"
    padding: "3px"
  finish-swatch-large:
    rounded: "{rounded.pill}"
    size: "36px"
    padding: "3px"
  global-nav:
    backgroundColor: "{colors.nav-glass}"
    textColor: "{colors.foreground}"
    typography: "{typography.label}"
    height: "44px"
  product-subnav:
    backgroundColor: "rgb(255 255 255 / 0.8)"
    textColor: "{colors.foreground}"
    typography: "{typography.title-card}"
    height: "52px"
  search-input:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    typography: "{typography.title}"
  bag-flyout:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.xl}"
    padding: "{spacing.card}"
    width: "min(380px, calc(100vw - 24px))"
  device-thumb:
    backgroundColor: "{colors.muted}"
    rounded: "{rounded.xl}"
    size: "56px"
    padding: "6px"
  shelf-arrow:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.pill}"
    size: "36px"
  mfe-zone-label:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.sm}"
    padding: "0 8px"
---

# Design System: Calque

## Overview

**Creative North Star: "L'objet est la page"**

Calque est une vitrine de marque d'électronique fictive, construite dans le canon des boutiques Apple que le brief impose. Chaque produit occupe une tuile à l'échelle héroïque : son nom en très grand, une phrase d'accroche, un prix, ses pastilles de finition, deux pilules d'action, puis l'appareil lui-même, dessiné en géométrie vectorielle nette et teinté par la finition choisie, posé sur le bord bas de la tuile. On achète là où l'on regarde, sans quitter la page.

La densité est faible et la retenue est la règle : trois fonds seulement (blanc, gris brume, noir) qui alternent de tuile en tuile, une encre presque noire, un gris secondaire, et un unique bleu d'action. Une seule famille, Geist, porte tous les rôles ; la hiérarchie vient de la taille, du poids et d'un serrage négatif marqué sur les grands titres. Les surfaces sont plates ; seuls les objets blancs posés sur du gris et les couches qui flottent au-dessus de la page reçoivent une ombre douce.

Le monde refuse la grille de vignettes avec un bouton d'achat sous chacune, les photos ou actifs d'Apple, et le mode sombre (la boutique est claire ; les tuiles noires lui donnent son contraste). Il porte aussi une couche propre au lab : les frontières entre micro-frontends peuvent être révélées sur la page, et chaque remote garde ses styles dans sa propre zone.

**Key Characteristics:**
- Un produit par tuile, à l'échelle héroïque, achetable sur place.
- Fonds alternés blanc / brume / noir, séparés par des interstices de 12px plutôt que par des bordures.
- Un seul bleu d'action, en pilules ; un seul accent d'état (signal) issu des données.
- Geist partout, titres serrés (-0.03em à -0.035em), titres-phrases terminés par un point.
- Appareils dessinés en SVG, recolorés par la finition avec une transition de 450ms.
- Barre de navigation translucide de 44px ; recherche qui tombe de la barre sur une page floutée.
- Styles de chaque remote cloisonnés sous `[data-mfe="<nom>"]`.

## Colors

Une palette quasi achromatique à trois fonds, où un bleu d'action et un orange d'état sont les seules couleurs franches ; tout le reste de la couleur vient des finitions des produits.

### Primary
- **Bleu d'action** (`primary`, #0071e3) : remplit les pilules « Ajouter au sac » et « Réessayer », sert de contour aux pilules secondaires, d'anneau de focus (`ring`), de couleur de caret et de sélection (22 % de mélange), et d'étiquette des zones micro-frontends. Le texte blanc dessus atteint 4,70:1.
- **Bleu lien** (`link`, #0066cc) : liens textuels sur fond clair (« Tout voir », « Vider le sac », « Afficher les micro-frontends »), soulignés au survol avec un décalage de 0.2em.
- **Bleu lien sur noir** (`link-on-dark`, #2997ff) : remplace le bleu d'action pour la pilule secondaire posée sur une tuile noire (6,96:1).

### Secondary
- **Orange signal** (`signal`, #b64400) : réservé à deux états issus des données, « Nouveau » et « Plus que quelques exemplaires » (5,5:1 sur blanc, 5,05:1 sur brume).
- **Orange signal sur noir** (`signal-on-dark`, #ff9f43) : le même « Nouveau » sur une tuile noire.

### Neutral
- **Encre** (`foreground`, #1d1d1f) : tout le texte courant, titres compris, et l'anneau de la pastille de finition sélectionnée sur fond clair.
- **Gris secondaire** (`muted-foreground`, #6e6e73) : prix sous les titres de tuile, descriptions, seconde moitié des titres-phrases, pied de page (4,66:1 sur brume).
- **Papier** (`background`, #ffffff) : fond des tuiles claires, des cartes, du panneau de recherche et du sac (`card` et `popover` en sont des alias).
- **Brume** (`muted`, #f5f5f7) : tuiles grises, fond du `main` et du pied de page, scène de la fiche produit, vignettes d'appareils (`accent` en est un alias).
- **Galet** (`secondary`, #e8e8ed) : fond des flèches de l'étagère.
- **Filet** (`border`, #d2d2d7) : séparateurs fins (fiche produit, sac, pied de page) ; c'est aussi la bordure par défaut de tout élément (`input`).
- **Verre de nav** (`nav-glass`, rgb(250 250 252 / 0.8)) : fond translucide de la barre globale, avec flou et saturation.
- **Nuit** (`tile-dark`, #000000) : tuiles noires et bandeau « en trois points » de la fiche produit.
- **Encre de nuit** (`tile-dark-foreground`, #f5f5f7) et **gris de nuit** (`tile-dark-muted`, #a1a1a6) : texte principal et secondaire sur les tuiles noires.
- **Rouge erreur** (`destructive`, #d70015) : messages d'échec (recherche, sac), sur un fond rosé #fff2f1 dans le sac.

### Named Rules
**La règle du bleu unique.** Le bleu d'action est la seule couleur d'interface qui appelle un geste : pilules, focus, liens. Il n'est jamais un fond de section ni une décoration.

**La règle de l'état venu des données.** L'orange signal n'apparaît que lorsqu'une donnée le justifie (`isNew`, `lowStock`). Aucun autre accent chromatique n'est introduit dans l'interface ; la couleur vivante appartient aux finitions des produits.

**La règle des variantes de nuit.** Sur une tuile noire, le lien passe à `link-on-dark` et le signal à `signal-on-dark`, le texte à `tile-dark-foreground` / `tile-dark-muted`. La pilule primaire, elle, garde le bleu d'action.

## Typography

**Display Font:** Geist (avec ui-sans-serif, system-ui, sans-serif)
**Body Font:** Geist (même pile)

**Character:** Une grotesque géométrique et nette, chargée en graisse variable 100–900 depuis Google Fonts, avec le jeu stylistique `ss01` activé et un léger serrage (-0.01em) sur tout le corps. Les grands titres se resserrent fortement et s'équilibrent (`text-balance`), ce qui leur donne la densité d'une affiche produit.

### Hierarchy
- **Display** (`display`, 600) : nom du produit dans une tuile pleine, en tête de la page d'accueil (h1) puis de chaque tuile pleine.
- **Display de page** (`display-page`, 600) : nom de catégorie en tête de page catégorie. La fiche produit utilise la même voix, un cran plus petite (clamp(2.5rem, 5vw, 3.5rem), interlignage 1.04).
- **Headline** (`headline`, 600) : titres de section (« La boutique. », « … en trois points. »).
- **Headline de tuile** (`headline-tile`, 600) : nom du produit dans une demi-tuile.
- **Title** (`title`, 600) : titre de l'étagère, titre du sac, prix sur la fiche, champ de recherche. Les points forts de la fiche produit montent à 1.375rem dans la même voix.
- **Title de carte** (`title-card`, 600) : nom du produit dans une carte d'étagère et dans la sous-navigation produit.
- **Lead** (`lead`, 400) : accroche sous le nom dans une tuile pleine, limitée à 38ch ; la fiche produit l'affiche à 1.375rem.
- **Body** (`body`, 400) : description longue de la fiche produit, limitée à 52ch.
- **UI** (`ui`, 500) : texte des pilules et des lignes du sac.
- **Caption** (`caption`, 400) : accroches de carte (deux lignes au plus), prix et états de stock.
- **Label** (`label`, 400) : liens de la barre globale, nom de la finition choisie, pied de page, en-têtes de listes de recherche. La bande de catégories utilise 13px.

### Named Rules
**La règle Geist partout.** Une seule famille. La hiérarchie se construit avec la taille, les graisses 400 / 500 / 600 et le serrage (-0.035em à -0.01em), jamais avec une seconde police.

**La règle du titre-phrase.** Les titres de section sont des phrases terminées par un point, dont la seconde moitié passe en gris secondaire : « La boutique. Tout Calque, vendu en France. », « Finition. Choisis ta couleur. », « Tous les produits. 9 références. »

## Layout

Le modèle spatial est un empilement vertical de tuiles pleine largeur, sans grille de colonnes globale. Une tuile pleine occupe au moins la première fenêtre (min(100svh - 44px, 1000px)) : le texte est centré en haut, l'appareil est poussé sur le bord bas. Sur l'accueil, deux tuiles pleines (claire puis noire) précèdent une paire de demi-tuiles grises côte à côte à partir de 768px ; toutes sont séparées par des interstices blancs de 12px (`tile-gap`), et la paire est retirée de 12px des bords. Sur une page catégorie, les produits forment un damier de demi-tuiles claires et noires sur fond brume ; un produit seul reçoit la tuile pleine.

Le contenu textuel courant vit dans une colonne de 980px centrée avec une gouttière de 20px (`gutter`) ; la fiche produit s'élargit à 1180px en deux colonnes (1.25fr / 1fr) dont la scène de gauche reste collée sous les deux barres ; la barre globale se cale sur 1024px ; le panneau de recherche sur 680px. Les sections pleines respirent en 80px (`section`) et montent à 112px (`section-lg`) pour le bandeau noir de la fiche.

L'étagère « Tous les produits » défile horizontalement avec accroche magnétique, des cartes de 300px (78vw sur téléphone, 320px au plus) espacées de 20px (`shelf-gap`), son retrait suivant la colonne de 980px ; deux flèches rondes la pilotent à partir de 640px. Points de rupture : ceux de Tailwind, 640px, 768px et 1024px. Sur téléphone, les appareils larges d'une tuile pleine (portable, écran, stylet, dock) débordent de 112 à 124 % et sont rognés par la tuile, comme sur une vitrine.

### Named Rules
**La règle de l'objet-page.** Chaque produit mis en avant est une tuile entière, à son échelle crédible (un téléphone n'est pas dessiné aussi large qu'un portable), achetable sur place. Les cartes d'étagère sont des liens vers la fiche, sans bouton d'achat.

**La règle du remote cloisonné.** Tout remote embarque sa propre feuille Tailwind sans preflight ni `:root` (les globales appartiennent à l'hôte), fait `@reference` vers `@acme/ui/styles/theme.css`, et passe par un plugin PostCSS qui préfixe chaque sélecteur par `[data-mfe="<nom>"]` (voir `apps/catalog/vite.config.ts`). Ses pages exposées s'enveloppent dans un `<div data-mfe="<nom>">` sans classe. Ainsi ses utilitaires ne touchent jamais l'hôte et l'emportent dans sa propre zone quel que soit l'ordre de chargement.

## Elevation & Depth

Le système est plat par défaut et tire sa profondeur de l'alternance des fonds. Les tuiles n'ont ni ombre ni bordure. Deux ombres douces, sans décalage dur, sont réservées aux objets blancs posés sur la brume (cartes d'étagère) et aux couches qui flottent au-dessus de la page (sac, panneau de recherche, bouton du lab). Le verre translucide (flou et saturation) marque les barres collantes ; le panneau de recherche floute la page derrière un voile noir à 25 %. Dans les dessins, chaque appareil repose sur une ombre portée au sol, une ellipse floutée noire à 22 %.

### Shadow Vocabulary
- **Carte** (`box-shadow: 0 4px 18px -4px rgb(0 0 0 / 0.12)`, `--shadow-card`) : cartes d'étagère au repos.
- **Couche flottante** (`box-shadow: 0 18px 50px -12px rgb(0 0 0 / 0.28)`, `--shadow-flyout`) : sac, panneau de recherche, bouton « Micro-frontends », et carte d'étagère au survol.
- **Contour de pilule** (`box-shadow: inset 0 0 0 1px currentColor`) : la pilule secondaire dessine son trait en ombre interne, à la couleur du texte.
- **Anneau de finition** (`box-shadow: 0 0 0 1.5px #1d1d1f`, ou #f5f5f7 sur noir) : pastille sélectionnée, à 3px de la pastille.

### Named Rules
**La règle du plat par défaut.** Les tuiles et les sections ne portent jamais d'ombre. Une ombre signale un objet qui flotte ; au survol, une carte passe de l'ombre carte à l'ombre flottante, rien de plus.

## Shapes

Trois formes suffisent : la pilule entièrement arrondie pour tout ce qui se touche (boutons, pastilles de finition, flèches, bouton du lab), le conteneur à arrondi généreux pour les objets posés (18px pour les cartes, le sac et les vignettes d'appareils de 56px ; 28px pour la scène de la fiche produit et les squelettes de chargement), et l'angle droit pour les tuiles et les bandeaux qui vont d'un bord à l'autre. Les petits arrondis (6px, 8px, 12px) restent aux éléments de service : étiquette et contour des zones micro-frontends, lignes de résultats de recherche, vignette de recherche de 48px. Les séparateurs sont des filets de 1px ; sur noir, un filet blanc à 20 %.

## Components

### Buttons
Des pilules sobres et franches, un seul niveau d'emphase pleine.
- **Shape :** entièrement arrondie (`pill`).
- **Primaire :** fond bleu d'action, texte blanc en `ui`, 40px de haut et 20px de marge latérale ; 48px pleine largeur à 17px sur la fiche produit, 28px en 12px dans la sous-navigation. Les libellés suivent l'état : « Ajouter au sac », « Ajout… », « Épuisé » ; désactivé à 40 % d'opacité.
- **Hover / Focus :** le fond change par transition de couleur ; le focus clavier est global, un contour de 2px au bleu d'action décalé de 2px.
- **Secondaire :** pilule transparente au contour interne de 1px, texte bleu d'action ; au survol elle se remplit (fond bleu, texte blanc). Sur noir, elle passe à `link-on-dark` et se remplit avec un texte noir.
- **Liens textuels :** bleu lien, soulignés au survol seulement.

### Chips
- **Pastilles de finition :** groupe radio de disques de 28px (36px sur la fiche produit), chacun peint de la couleur hexadécimale de la finition, avec un filet interne et un léger creux en bas. La pastille choisie reçoit un anneau à 3px ; les flèches du clavier déplacent la sélection. Le nom de la finition s'affiche dessous en `label` et est annoncé. Choisir une finition recolore le dessin de l'appareil en 450ms (`cubic-bezier(0.16, 1, 0.3, 1)`).
- **Points de finition :** dans les cartes, des points de 10px non interactifs résument les finitions disponibles.

### Cards / Containers
- **Corner Style :** 18px (`xl`).
- **Background :** papier, posé sur la brume.
- **Shadow Strategy :** ombre carte au repos, ombre flottante au survol (300ms) ; le dessin grandit de 3 % (500ms, même courbe).
- **Border :** aucune.
- **Internal Padding :** 24px (`card`). Une scène de hauteur fixe (176px) aligne tous les textes quelle que soit la forme de l'appareil ; « Nouveau » se place en haut à droite en signal ; le prix tombe en bas de carte avec l'état de stock.

### Inputs / Fields
- **Style :** le champ de recherche n'a ni contour ni fond : texte en `title`, loupe grise de 24px à sa gauche, placeholder en gris secondaire à 70 %.
- **Focus :** pas d'anneau dans le champ, le caret au bleu d'action suffit ; le reste de l'interface garde l'anneau de focus global.
- **Error / Disabled :** les erreurs sont des phrases en rouge erreur, rôle `alert`.

### Navigation
- **Barre globale :** 44px, collante, en verre de nav (flou xl, saturation 1.8). Marque Calque (deux calques décalés) à gauche, catégories en `label` réparties au centre à partir de 768px (encre à 80 %, pleine au survol ou sur la page courante), puis recherche, sac et menu en cibles de 44px avec des icônes au trait de 1.6. Sur téléphone, le menu s'ouvre plein écran et liste les catégories en 28px semi-gras, qui entrent l'une après l'autre (décalage de 30ms).
- **Sous-navigation produit :** 52px, collante sous la barre globale, papier à 80 % avec flou et filet bas ; nom du produit à gauche, prix et pilule compacte à droite.
- **Bande de catégories :** vignettes d'appareils de 56px dessinées dans leur finition la plus sombre (pour rester visibles sur la brume), libellé en 13px, catégorie courante en semi-gras.

### Search Panel (signature)
La recherche tombe de la barre : le panneau papier couvre la bande de navigation, glisse depuis le haut en 300ms avec l'ombre flottante, et la page derrière est floutée sous un voile noir à 25 %. Sans saisie, il propose des liens rapides vers les catégories ; pendant la saisie (anti-rebond de 200ms), les résultats arrivent en lignes avec vignette, terme surligné en semi-gras, catégorie et prix. Le bouton de fermeture prend la place de la loupe.

### Bag Flyout (signature)
Un popover papier de 380px au plus, arrondi à 18px, sous l'icône du sac, ouvert par l'icône ou par un ajout réussi. Titre « Ton sac » en `title`, lignes avec vignette de 56px, finition, quantité et total ; la ligne modifiée se ré-anime. Le total en `title` sur un filet, « Vider le sac » en lien, et la mention que le paiement n'existe pas dans ce lab.

### Device Art (signature)
Chaque produit est dessiné en SVG frontal (portable, téléphone, écouteurs, casque, écran, stylet, dock) à partir d'une seule couleur de finition, d'où sont dérivés une lumière (+38 % de blanc), une ombre (+22 % de noir), une arête (+45 % de noir) et un fond d'écran sombre teinté. Les remplissages et les arrêts de dégradé passent d'une finition à l'autre en 450ms. Les dégradés vivent ici, dans les objets, et nulle part ailleurs.

### Micro-frontend Zones (signature du lab)
À la demande (bouton flottant « Micro-frontends » en bas à gauche à partir de 640px, ou lien du pied de page), chaque zone de la page reçoit un contour pointillé de 2px au bleu d'action à 70 % et une étiquette bleue en 11px semi-gras qui nomme son propriétaire et son port (« Shell, hôte :3000 », « Remote catalog :3001 »).

## Do's and Don'ts

### Do:
- **Do** donner à chaque produit mis en avant une tuile entière, l'appareil dessiné sur son bord bas, avec ses pastilles de finition et la pilule « Ajouter au sac » sur place.
- **Do** alterner les fonds blanc (#ffffff), brume (#f5f5f7) et nuit (#000000) d'une section à l'autre, séparés par 12px d'interstice.
- **Do** écrire les titres de section comme des phrases terminées par un point, seconde moitié en `muted-foreground`.
- **Do** basculer sur `link-on-dark` et `signal-on-dark` dès qu'un lien ou un état se pose sur une tuile noire.
- **Do** cloisonner les styles de tout nouveau remote sous `[data-mfe="<nom>"]` par le plugin PostCSS, sans preflight ni `:root`, en `@reference` du thème partagé.
- **Do** garder toute animation sous `motion-safe` ou la courbe `--ease-out-expo` ; la préférence de mouvement réduit tout à 0.01ms.
- **Do** maintenir au moins 4,5:1 pour le texte blanc sur toute teinte du bleu d'action, y compris au survol.

### Don't:
- **Don't** composer une grille de vignettes avec un bouton d'achat sous chacune.
- **Don't** utiliser le bleu d'action comme fond de section ou comme décoration.
- **Don't** introduire une seconde police, ni un mode sombre : la boutique est claire, les tuiles noires portent le contraste.
- **Don't** poser d'ombre ou de bordure sur une tuile ; l'ombre est réservée aux objets qui flottent, et jamais en décalage dur.
- **Don't** mettre de dégradé sur un fond de tuile ou de section ; les dégradés appartiennent aux dessins d'appareils.
- **Don't** reproduire le nom, le logo, les produits ou les images d'Apple.
- **Don't** ajouter de surtitre ou de mention décorative au-dessus d'un titre ; seuls les états issus des données (« Nouveau », stock) s'affichent en signal.
- **Don't** laisser un remote livrer des utilitaires non préfixés ou réécrire les globales de l'hôte.
