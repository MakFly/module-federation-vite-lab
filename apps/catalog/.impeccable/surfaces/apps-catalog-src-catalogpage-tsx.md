---
version: 1
slug: "apps-catalog-src-catalogpage-tsx"
primary_target: "apps/catalog/src/CatalogPage.tsx"
related_targets: ["apps/shell/src/App.tsx","apps/catalog/src/ProductPage.tsx"]
---

## Scope

Calque store: home, category pages, product page (catalog remote) inside the shell's global nav, search overlay, bag flyout and footer. Visitor mode: Persuade for home and product pages; the bag and search work as Operate.

Audience: lab developer + fictional shopper. Action: choose a finish and add to bag, from the first viewport. Proof: real catalog data from the BFF, business rules surfaced. Constraints: no invented claims, no Apple assets, no useEffect, mobile first-class.

## Direction contract

THESIS: A product store where the object is the page: every product is shown at hero scale, drawn from its own finish colour, and buyable where it is shown. It refuses the category grid of thumbnails with a buy button under each.

OWN-WORLD: White and #f5f5f7 grounds alternating with black tiles; ink #1d1d1f, secondary #6e6e73, action blue #0071e3 in pill buttons; Geist for everything, tight display tracking; 44px translucent global nav; 18px radius white cards on grey with a soft offset shadow; devices drawn as crisp vector geometry tinted by their finish.

STORY: The visitor sees the flagship laptop large, recolours it with the finish swatches, and adds it to the bag without leaving the page. Lower down, a category strip and a horizontal shelf lead to every product; search opens over the page and answers as you type.

FIRST VIEWPORT: Global nav. Centred product name at display scale, tagline, price line, finish swatches, two pills (Ajouter au sac primary, En savoir plus secondary), then the device drawing filling the lower half of the viewport, bleeding to the fold (on phones, wide devices bleed past the side edges). Category pages repeat the hero tile at half size, buyable in place.

FORM: Apple store canon, pinned by the brief in the user's own words: « site ecommerce type apple avec recherche apple design » (position 1 of 1). A brief-pinned direction beats the roll, so concept-seed was not run. seed: none (direction pinned by the user's brief). Signature interaction: finish swatches recolour the drawn device with a 450ms colour transition; search panel drops from the nav with the page blurred behind it.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved

- Real product photography would replace the SVG drawings.
