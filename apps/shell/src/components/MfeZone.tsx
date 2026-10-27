import type { ReactNode } from 'react';
import { cn } from '@acme/ui/lib/utils';

type Props = { show: boolean; label: string; inset?: boolean; className?: string; children: ReactNode };

// Makes a micro-frontend's boundary visible: who owns this zone, and where it is served from.
export default function MfeZone({ show, label, inset, className, children }: Props) {
  return (
    <div
      className={cn(
        'relative rounded-md',
        show && 'outline-2 outline-dashed outline-primary/70',
        show && (inset ? '-outline-offset-4' : 'outline-offset-[6px]'),
        className,
      )}
    >
      {show && (
        <span className={cn(
          'pointer-events-none absolute z-[60] rounded-sm bg-primary px-2 text-[11px] leading-5 font-semibold text-primary-foreground motion-safe:animate-in motion-safe:fade-in',
          inset ? 'top-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap' : '-top-[17px] left-3',
        )}>
          {label}
        </span>
      )}
      {children}
    </div>
  );
}
