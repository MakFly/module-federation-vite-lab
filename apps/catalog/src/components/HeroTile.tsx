import { useState } from 'react';
import { Link } from 'react-router';
import type { CatalogProductView } from '@acme/contracts';
import { paths } from '@acme/bff-client';
import { DeviceArt } from '@acme/ui/components/device-art';
import { cn } from '@acme/ui/lib/utils';
import { useCountry } from '../lib/country';
import { useAddToBag } from '../lib/use-add-to-bag';
import { FinishPicker } from './FinishPicker';

type Props = {
  product: CatalogProductView;
  tone: 'light' | 'grey' | 'dark';
  size: 'full' | 'half';
  headingLevel?: 'h1' | 'h2';
};

// Each device at a believable scale: a phone is not drawn as wide as a laptop. [full, half]
// On phones, wide devices in a full tile bleed past the edges (the tile clips them), as on a store hero.
const artWidth: Record<CatalogProductView['formFactor'], [string, string]> = {
  laptop: ['w-[124%] max-w-none sm:w-full sm:max-w-[760px]', 'w-full max-w-[440px]'],
  display: ['w-[118%] max-w-none sm:w-full sm:max-w-[680px]', 'w-full max-w-[420px]'],
  phone: ['w-[86%] max-w-[380px]', 'w-full max-w-[260px]'],
  earbuds: ['w-full max-w-[420px]', 'w-full max-w-[300px]'],
  headphones: ['w-[92%] max-w-[400px]', 'w-full max-w-[280px]'],
  stylus: ['w-[120%] max-w-none sm:w-full sm:max-w-[640px]', 'w-full max-w-[400px]'],
  dock: ['w-[112%] max-w-none sm:w-full sm:max-w-[560px]', 'w-full max-w-[380px]'],
};

const toneClass = {
  light: 'bg-background text-foreground',
  grey: 'bg-muted text-foreground',
  dark: 'bg-tile-dark text-tile-dark-foreground',
};

// One product at hero scale: recolour it with its finishes and add it to the bag right here.
export function HeroTile({ product, tone, size, headingLevel = 'h2' }: Props) {
  const country = useCountry();
  const { adding, add } = useAddToBag(country, product.id);
  const [finishId, setFinishId] = useState(product.finishes[0]!.id);
  const finish = product.finishes.find((item) => item.id === finishId)!;
  const Heading = headingLevel;
  const full = size === 'full';
  const dark = tone === 'dark';

  return (
    <section
      aria-labelledby={`hero-${product.id}`}
      className={cn(
        'flex flex-col items-center overflow-hidden px-5 text-center',
        toneClass[tone],
        // A full tile owns the first viewport: the drawing sits on its lower edge, the next tile starts below the fold.
        full ? 'min-h-[min(calc(100svh-2.75rem),1000px)] pt-12 sm:pt-14' : 'pt-10 sm:pt-12',
      )}
    >
      <Heading
        id={`hero-${product.id}`}
        className={cn('font-semibold tracking-[-0.03em] text-balance', full ? 'text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.05]' : 'text-[clamp(2rem,4vw,2.75rem)] leading-[1.08]')}
      >
        {product.name}
      </Heading>
      <p className={cn('mt-2 max-w-[38ch] text-balance', full ? 'text-[clamp(1.125rem,2.2vw,1.75rem)] leading-snug' : 'text-lg sm:text-xl', dark ? 'text-tile-dark-foreground/90' : 'text-foreground/85')}>
        {product.tagline}
      </p>
      <p className={cn('mt-3 text-[15px]', dark ? 'text-tile-dark-muted' : 'text-muted-foreground')}>
        {product.price.formatted}
        {product.isNew && <span className={cn('ml-2', dark ? 'text-[#ff9f43]' : 'text-signal')}>Nouveau</span>}
      </p>

      {product.finishes.length > 1 && (
        <div className="mt-5">
          <FinishPicker finishes={product.finishes} value={finishId} onChange={setFinishId} tone={dark ? 'dark' : 'light'} label={`Finition de ${product.name}`} />
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-center gap-3.5">
        <button
          type="button"
          disabled={!product.available || adding}
          onClick={() => add(finishId)}
          className="h-10 rounded-full bg-primary px-5 text-[15px] font-medium text-primary-foreground transition-colors hover:bg-[#0062c4] disabled:opacity-40"
        >
          {!product.available ? 'Épuisé' : adding ? 'Ajout…' : 'Ajouter au sac'}
        </button>
        <Link
          to={paths.product(country, product.id)}
          className={cn(
            'inline-flex h-10 items-center rounded-full px-5 text-[15px] font-medium shadow-[inset_0_0_0_1px_currentColor] transition-colors',
            dark ? 'text-[#2997ff] hover:bg-[#2997ff] hover:text-black' : 'text-primary hover:bg-primary hover:text-primary-foreground',
          )}
          aria-label={`En savoir plus sur ${product.name}`}
        >
          En savoir plus
        </Link>
      </div>

      <div className={cn('mt-auto shrink-0 pt-6', artWidth[product.formFactor][full ? 0 : 1])}>
        <DeviceArt formFactor={product.formFactor} finish={finish.hex} title={`${product.name}, finition ${finish.name}`} />
      </div>
    </section>
  );
}
