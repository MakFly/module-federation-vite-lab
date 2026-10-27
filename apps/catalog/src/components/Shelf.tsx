import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { CatalogProductView } from '@acme/contracts';
import { ProductCard } from './ProductCard';

// A horizontal, snap-scrolling shelf of product cards.
export function Shelf({ products, label }: { products: CatalogProductView[]; label: string }) {
  const track = useRef<HTMLUListElement>(null);
  // Scrolling is a reaction to the click, so it lives in the handler.
  const scroll = (direction: 1 | -1) => track.current?.scrollBy({ left: direction * track.current.clientWidth * 0.8, behavior: 'smooth' });

  return (
    <div className="relative">
      <ul
        ref={track}
        aria-label={label}
        className="flex snap-x snap-mandatory scroll-px-5 gap-5 overflow-x-auto px-5 pt-2 pb-10 [scrollbar-width:none] sm:scroll-px-[max(1.25rem,calc((100vw-980px)/2))] sm:px-[max(1.25rem,calc((100vw-980px)/2))]"
      >
        {products.map((product) => (
          <li key={product.id} className="w-[78vw] max-w-[320px] shrink-0 snap-start sm:w-[300px]">
            <ProductCard product={product} className="h-full" />
          </li>
        ))}
      </ul>
      <div className="mx-auto hidden max-w-[980px] justify-end gap-3 px-5 sm:flex">
        {([[-1, ChevronLeft, 'Produits précédents'], [1, ChevronRight, 'Produits suivants']] as const).map(([direction, Icon, name]) => (
          <button
            key={direction}
            type="button"
            onClick={() => scroll(direction)}
            aria-label={name}
            className="flex size-9 items-center justify-center rounded-full bg-secondary text-foreground/80 transition-colors hover:bg-[#dcdce1]"
          >
            <Icon aria-hidden="true" className="size-5" />
          </button>
        ))}
      </div>
    </div>
  );
}
