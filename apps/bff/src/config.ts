const list = (value: string | undefined, fallback: string) => (value ?? fallback).split(',').map((item) => item.trim());

export const config = {
  port: Number(process.env.PORT ?? 3003),
  apiUrl: process.env.API_URL ?? 'http://localhost:3002',
  apiTimeoutMs: Number(process.env.API_TIMEOUT_MS ?? 3000),
  // Origins allowed to send requests with the session cookie (CSRF protection).
  allowedOrigins: list(process.env.ALLOWED_ORIGINS, 'http://localhost:3000,http://localhost:3001'),
  secureCookies: process.env.NODE_ENV === 'production',
};

export type Config = typeof config;
