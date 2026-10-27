// BFF server-side state: the browser only holds an opaque identifier (httpOnly cookie).
// The API's cart identifiers never leave the server.
// In production: Redis or equivalent, with expiry, so that several instances can run.

export type Session = {
  id: string;
  cartIdFor(tenantId: string): string | undefined;
  attachCart(tenantId: string, cartId: string): void;
  forgetCart(tenantId: string): void;
};

export class SessionStore {
  private readonly cartsBySession = new Map<string, Map<string, string>>();

  has(sessionId: string): boolean {
    return this.cartsBySession.has(sessionId);
  }

  create(): string {
    const id = crypto.randomUUID();
    this.cartsBySession.set(id, new Map());
    return id;
  }

  get(sessionId: string): Session {
    const carts = this.cartsBySession.get(sessionId) ?? new Map<string, string>();
    this.cartsBySession.set(sessionId, carts);

    return {
      id: sessionId,
      cartIdFor: (tenantId) => carts.get(tenantId),
      attachCart: (tenantId, cartId) => { carts.set(tenantId, cartId); },
      forgetCart: (tenantId) => { carts.delete(tenantId); },
    };
  }
}
