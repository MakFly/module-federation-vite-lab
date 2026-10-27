import { useSyncExternalStore, type MouseEvent } from 'react';

// A tiny history router with no useEffect: the URL is an external store, read with
// useSyncExternalStore; navigation is an event (a click), handled where it happens.

export type Route =
  | { name: 'home' }
  | { name: 'category'; slug: string }
  | { name: 'product'; id: string }
  | { name: 'notFound' };

const listeners = new Set<() => void>();

const subscribe = (onChange: () => void) => {
  listeners.add(onChange);
  window.addEventListener('popstate', onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener('popstate', onChange);
  };
};

export function navigate(href: string) {
  if (href === location.pathname + location.search) return;
  history.pushState(null, '', href);
  listeners.forEach((listener) => listener());
  window.scrollTo({ top: 0 });
}

export const usePathname = () => useSyncExternalStore(subscribe, () => location.pathname, () => '/');

export function matchRoute(pathname: string): Route {
  const [, section, id, ...rest] = pathname.split('/');
  if (!section) return { name: 'home' };
  if (section === 'boutique' && id && !rest.length) return { name: 'category', slug: decodeURIComponent(id) };
  if (section === 'produit' && id && !rest.length) return { name: 'product', id: decodeURIComponent(id) };
  return { name: 'notFound' };
}

/**
 * Click delegation on the shell root: any same-origin <a> becomes a client navigation,
 * including links rendered by the catalog remote, which never imports this router.
 * React events bubble through portals, so links inside dialogs and popovers are covered too.
 */
export function interceptLinks(event: MouseEvent) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const anchor = (event.target as Element).closest('a');
  if (!anchor || anchor.target || anchor.hasAttribute('download')) return;
  const url = new URL(anchor.href);
  if (url.origin !== location.origin) return;
  event.preventDefault();
  navigate(url.pathname + url.search);
}
