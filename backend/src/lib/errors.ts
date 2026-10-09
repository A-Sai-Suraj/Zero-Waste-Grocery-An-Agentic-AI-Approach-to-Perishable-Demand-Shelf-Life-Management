export class HttpError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export function isPrismaErrorCode(error: unknown, code: string): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === code
  );
}

export function requireDatabase(databaseUrl: string | null): void {
  if (!databaseUrl) {
    throw new HttpError('Database is not configured', 503);
  }
}
