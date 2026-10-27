import type { KeyboardEvent } from 'react';
import type { FinishView } from '@acme/contracts';
import { cn } from '@acme/ui/lib/utils';

type Props = {
  finishes: FinishView[];
  value: string;
  onChange: (finishId: string) => void;
  tone?: 'light' | 'dark';
  label?: string;
  size?: 'sm' | 'lg';
  align?: 'center' | 'start';
};

// A radio group of swatches. Arrow keys move the selection, as in any native radio group.
export function FinishPicker({ finishes, value, onChange, tone = 'light', label, size = 'sm', align = 'center' }: Props) {
  const current = finishes.find((finish) => finish.id === value) ?? finishes[0]!;

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const index = finishes.findIndex((finish) => finish.id === current.id);
    const next = finishes[(index + step + finishes.length) % finishes.length]!;
    onChange(next.id);
    event.currentTarget.querySelector<HTMLButtonElement>(`[data-finish="${next.id}"]`)?.focus();
  };

  return (
    <div className={cn('flex flex-col gap-2.5', align === 'center' ? 'items-center' : 'items-start')}>
      <div role="radiogroup" aria-label={label ?? 'Finition'} onKeyDown={onKeyDown} className="flex items-center gap-3">
        {finishes.map((finish) => {
          const selected = finish.id === current.id;
          return (
            <button
              key={finish.id}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={finish.name}
              data-finish={finish.id}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(finish.id)}
              className={cn(
                'rounded-full p-[3px] transition-[box-shadow] duration-200',
                size === 'lg' ? 'size-9' : 'size-7',
                selected
                  ? tone === 'dark' ? 'shadow-[0_0_0_1.5px_#f5f5f7]' : 'shadow-[0_0_0_1.5px_#1d1d1f]'
                  : 'shadow-[0_0_0_1px_transparent]',
              )}
            >
              <span
                className="block size-full rounded-full shadow-[inset_0_0_0_1px_rgb(0_0_0/0.12),inset_0_-6px_10px_rgb(0_0_0/0.12)]"
                style={{ background: finish.hex }}
              />
            </button>
          );
        })}
      </div>
      <p className={cn('text-xs', tone === 'dark' ? 'text-tile-dark-muted' : 'text-muted-foreground')} aria-live="polite">
        {current.name}
      </p>
    </div>
  );
}
