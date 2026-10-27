import { useState } from 'react';
import { Outlet, ScrollRestoration, useLocation, useMatches, useNavigate, useNavigation, useParams } from 'react-router';
import { SquareDashed } from 'lucide-react';
import type { MfeHandle } from '@acme/contracts';
import { cn } from '@acme/ui/lib/utils';
import { Footer } from '../components/Footer';
import { GlobalNav } from '../components/GlobalNav';
import MfeZone from '../components/MfeZone';
import { bagUi } from '../lib/bag-ui';
import { defaultCountry, isCountry, swapCountry } from '../lib/countries';

const origins: Record<MfeHandle['mfe'], string> = { shell: 'Shell :3000', catalog: 'Remote catalog :3001' };

// The root route's element: the shell's chrome around whatever page the router matched,
// whether the shell or a remote owns it.
export function ShellLayout() {
  const params = useParams();
  const country = isCountry(params.country) ? params.country : defaultCountry;
  const navigation = useNavigation();
  const location = useLocation();
  const navigate = useNavigate();
  const [showZones, setShowZones] = useState(false);

  // Who renders the page: read from the matched routes' `handle`, set by their owner.
  const owner = useMatches().map((match) => match.handle as MfeHandle | undefined).filter(Boolean).at(-1);

  // Changing country is an event: same page in the other store; the bag of the previous one closes.
  const changeCountry = (next: string) => {
    bagUi.setOpen(false);
    void navigate(swapCountry(location.pathname, next));
  };

  return (
    <div className="flex min-h-svh flex-col">
      {/* Loaders run before a page renders: the previous page stays, a thin bar says something is coming. */}
      {navigation.state === 'loading' && (
        <div aria-hidden="true" className="fixed inset-x-0 top-0 z-[70] h-0.5 origin-left bg-primary motion-safe:animate-[nav-progress_2.5s_var(--ease-out-expo)_both]" />
      )}

      <MfeZone show={showZones} inset label="Shell, hôte :3000 (navigation, recherche, sac)" className="sticky top-0 z-50">
        <GlobalNav country={country} />
      </MfeZone>

      {/* Painted like the footer: on a short page or a tall screen, no white band between two grey grounds. */}
      <main className="flex-1 bg-muted" aria-busy={navigation.state === 'loading'}>
        <MfeZone show={showZones} inset label={owner ? `${origins[owner.mfe]} (${owner.page})` : origins.shell}>
          <Outlet />
        </MfeZone>
      </main>

      <MfeZone show={showZones} inset label="Shell :3000 (pied de page, pays)">
        <Footer country={country} onCountryChange={changeCountry} zonesShown={showZones} onToggleZones={() => setShowZones((value) => !value)} />
      </MfeZone>

      {/* Lab tool, not part of the store: shows which deployment owns each zone. */}
      <button
        type="button"
        aria-pressed={showZones}
        onClick={() => setShowZones((value) => !value)}
        className={cn(
          // Hidden on phones, where it would cover content; the footer carries the same toggle.
          'fixed bottom-4 left-4 z-40 hidden h-9 items-center sm:inline-flex gap-2 rounded-full px-3.5 text-xs font-medium shadow-flyout transition-colors',
          showZones ? 'bg-primary text-primary-foreground' : 'bg-white/90 text-foreground backdrop-blur hover:bg-white',
        )}
      >
        <SquareDashed aria-hidden="true" className="size-4" />
        Micro-frontends
      </button>

      <ScrollRestoration />
    </div>
  );
}
