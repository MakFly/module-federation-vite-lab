import type { CatalogProductView } from '@acme/contracts';
import { paths } from '@acme/bff-client';
import { DeviceArt } from '@acme/ui/components/device-art';
import { cn } from '@acme/ui/lib/utils';

// A shelf card: the whole card is the link to the product page.
export function ProductCard({ product, className }: { product: CatalogProductView; className?: string }) {
  return (
    <a
      href={paths.product(product.id)}
      className={cn(
        'group relative flex flex-col rounded-[18px] bg-card p-6 shadow-card transition-shadow duration-300 hover:shadow-flyout focus-visible:outline-offset-4',
        className,
      )}
    >
      {product.isNew && <span className="absolute top-5 right-6 text-xs font-medium text-signal">Nouveau</span>}
      {/* Fixed-height stage: every card's text starts at the same line, whatever the device's shape. */}
      <div className="flex h-44 items-center justify-center py-3">
        <DeviceArt
          formFactor={product.formFactor}
          finish={product.finishes[0]!.hex}
          className="h-full w-auto max-w-full transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-[1.03]"
        />
      </div>
      <div className="mt-4 flex items-center gap-1.5" aria-label={`${product.finishes.length} finitions`}>
        {product.finishes.map((finish) => (
          <span key={finish.id} className="size-2.5 rounded-full shadow-[inset_0_0_0_1px_rgb(0_0_0/0.15)]" style={{ background: finish.hex }} />
        ))}
      </div>
      <h3 className="mt-3 text-xl font-semibold tracking-[-0.02em]">{product.name}</h3>
      <p className="mt-1 line-clamp-2 text-sm leading-snug text-muted-foreground">{product.tagline}</p>
      <p className="mt-auto pt-5 text-sm">
        {product.price.formatted}
        {!product.available && <span className="ml-2 text-muted-foreground">Épuisé</span>}
        {product.lowStock && <span className="ml-2 text-signal">Plus que quelques exemplaires</span>}
      </p>
    </a>
  );
}
