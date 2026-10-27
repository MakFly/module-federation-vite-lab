import { Popover } from 'radix-ui';
import { RotateCw, ShoppingBag, X } from 'lucide-react';
import { DeviceArt } from '@acme/ui/components/device-art';
import type { BagState } from '../lib/use-bag';

const plural = (count: number) => `${count} article${count > 1 ? 's' : ''}`;

// The bag lives in the shell: a flyout under the nav, opened by the icon or by the bag action after an add.
export function BagFlyout({ state }: { state: BagState }) {
  const { cart, pending } = state;
  const count = cart?.itemCount ?? 0;

  return (
    <Popover.Root open={state.open} onOpenChange={state.setOpen}>
      <Popover.Trigger
        aria-label={count ? `Sac, ${plural(count)}` : 'Sac, vide'}
        className="relative flex size-11 items-center justify-center text-foreground/80 transition-colors hover:text-foreground"
      >
        <ShoppingBag aria-hidden="true" className="size-[17px]" strokeWidth={1.6} />
        {count > 0 && (
          <span key={count} className="absolute top-[21px] left-1/2 -translate-x-1/2 text-[9px] leading-none font-semibold tabular-nums motion-safe:animate-in motion-safe:zoom-in-50 motion-safe:duration-300">
            {count}
          </span>
        )}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={4}
          collisionPadding={12}
          className="z-50 w-[min(380px,calc(100vw-24px))] rounded-[18px] bg-popover p-6 text-popover-foreground shadow-flyout outline-none data-[state=open]:motion-safe:animate-in data-[state=open]:motion-safe:fade-in data-[state=open]:motion-safe:slide-in-from-top-2 data-[state=open]:motion-safe:duration-300"
        >
          <div className="flex items-baseline justify-between">
            <h2 className="text-2xl font-semibold tracking-[-0.02em]">Ton sac</h2>
            <span className="text-sm text-muted-foreground tabular-nums">{plural(count)}</span>
          </div>

          {state.actionError && (
            <p role="alert" className="mt-4 rounded-xl bg-[#fff2f1] p-3 text-sm text-destructive">
              {state.actionError}
            </p>
          )}

          {state.loadError ? (
            <div role="alert" className="mt-5 space-y-3 text-sm">
              <p>Ton sac n’a pas pu être chargé. {state.loadError.message}</p>
              <button type="button" onClick={state.retryLoad} className="inline-flex items-center gap-2 text-link hover:underline">
                <RotateCw aria-hidden="true" className="size-4" /> Réessayer
              </button>
            </div>
          ) : !cart ? (
            <div role="status" aria-label="Chargement du sac" className="mt-5 h-20 rounded-xl bg-muted motion-safe:animate-pulse" />
          ) : cart.lines.length === 0 ? (
            <p className="mt-4 text-[15px] text-muted-foreground">Ton sac est vide. Choisis une finition sur un produit pour l’y ajouter.</p>
          ) : (
            <ul className="mt-5 max-h-[50svh] space-y-4 overflow-y-auto" aria-busy={pending}>
              {cart.lines.map((line) => (
                // The key includes the quantity: the changed line re-animates, showing what just happened.
                <li key={`${line.lineId}-${line.quantity}`} className="flex items-center gap-3 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-left-1 motion-safe:duration-300">
                  <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-muted p-1.5">
                    <DeviceArt formFactor={line.formFactor} finish={line.finish.hex} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-medium">{line.name}</span>
                    <span className="block text-xs text-muted-foreground">{line.finish.name}, {line.quantity} × {line.unitPrice.formatted}</span>
                  </span>
                  <span className="text-sm tabular-nums">{line.lineTotal.formatted}</span>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => state.remove(line.lineId)}
                    aria-label={`Retirer ${line.name} ${line.finish.name}`}
                    className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40"
                  >
                    <X aria-hidden="true" className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 flex items-baseline justify-between border-t pt-4">
            <span className="text-[15px]">Total</span>
            <span className="text-2xl font-semibold tabular-nums tracking-[-0.02em]">{cart?.total.formatted ?? '—'}</span>
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <button type="button" disabled={pending || count === 0} onClick={state.clear} className="text-sm text-link hover:underline disabled:text-muted-foreground disabled:no-underline">
              Vider le sac
            </button>
            <p className="text-right text-xs text-muted-foreground">Le paiement n’existe pas dans ce lab.</p>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
