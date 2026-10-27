import { Component, type ErrorInfo, type ReactNode } from 'react';
import { RotateCw } from 'lucide-react';
import { Button } from '@acme/ui/components/button';

export default class RemoteBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Remote catalog indisponible', error, info);
  }

  render() {
    if (this.state.failed) {
      return (
        <section role="alert" className="mx-auto flex max-w-[640px] flex-col items-center gap-4 px-5 py-28 text-center">
          <h2 className="text-[2.5rem] font-semibold tracking-[-0.03em]">Le catalogue n’a pas pu être chargé.</h2>
          <p className="max-w-[52ch] text-lg leading-relaxed text-muted-foreground">
            Le remote catalog servi par :3001 ne répond pas. La recherche et ton sac restent utilisables : ils appartiennent au shell.
          </p>
          <Button type="button" className="rounded-full" onClick={() => window.location.reload()}>
            <RotateCw aria-hidden="true" /> Recharger la page
          </Button>
        </section>
      );
    }

    return this.props.children;
  }
}
