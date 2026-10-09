import { HttpError } from '../lib/errors.js';

const localOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];

export function parseCorsOrigins(raw: string | undefined, nodeEnvironment: string): string[] {
  const origins = raw
    ? raw.split(',').map((origin) => origin.trim()).filter(Boolean)
    : nodeEnvironment === 'production'
      ? []
      : localOrigins;

  if (nodeEnvironment === 'production' && origins.length === 0) {
    throw new Error('CORS_ORIGINS must contain at least one allowed origin in production');
  }

  for (const origin of origins) {
    if (origin === '*') {
      throw new Error('CORS_ORIGINS cannot contain wildcard origins');
    }
    let parsed: URL;
    try {
      parsed = new URL(origin);
    } catch {
      throw new Error('CORS_ORIGINS must contain only absolute HTTP or HTTPS origins');
    }
    if (!['http:', 'https:'].includes(parsed.protocol) || parsed.origin !== origin || parsed.username || parsed.password) {
      throw new Error('CORS_ORIGINS must contain only HTTP or HTTPS origins without paths or credentials');
    }
    if (nodeEnvironment === 'production' && parsed.protocol !== 'https:') {
      throw new Error('Production CORS origins must use HTTPS');
    }
  }
  return [...new Set(origins)];
}

export function createCorsOriginCallback(origins: readonly string[]) {
  const allowed = new Set(origins);
  return (origin: string | undefined, callback: (error: Error | null, allowed?: boolean) => void): void => {
    if (!origin || allowed.has(origin)) {
      callback(null, true);
      return;
    }
    callback(new HttpError('Origin is not allowed by CORS policy', 403));
  };
}
