import { getCookie, setCookie } from 'hono/cookie';
import { createMiddleware } from 'hono/factory';
import type { AppEnv } from '../http/env.ts';
import type { SessionStore } from './session.store.ts';

export const SESSION_COOKIE = 'bff_sid';

export const sessionMiddleware = (store: SessionStore, { secure }: { secure: boolean }) =>
  createMiddleware<AppEnv>(async (c, next) => {
    let sessionId = getCookie(c, SESSION_COOKIE);

    // Missing cookie or unknown session (BFF restarted): open a new one.
    if (!sessionId || !store.has(sessionId)) {
      sessionId = store.create();
      setCookie(c, SESSION_COOKIE, sessionId, {
        httpOnly: true, // unreadable from browser JS
        sameSite: 'Lax',
        secure,
        path: '/bff',
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    c.set('session', store.get(sessionId));
    await next();
  });
