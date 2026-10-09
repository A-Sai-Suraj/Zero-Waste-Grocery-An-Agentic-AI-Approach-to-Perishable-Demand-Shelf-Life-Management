import dotenv from 'dotenv';
import { parseCorsOrigins } from './cors.js';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';
const mlServiceUrl = process.env.FASTAPI_BASE_URL ?? process.env.ML_SERVICE_URL ?? 'http://localhost:8000';
const nodeEnv = process.env.NODE_ENV ?? 'development';
const port = Number(process.env.PORT ?? 4000);
const demoMode = process.env.DEMO_MODE === 'true' && nodeEnv !== 'production';
const corsOrigins = parseCorsOrigins(process.env.CORS_ORIGINS, nodeEnv);

export const env = {
  port,
  nodeEnv,
  databaseUrl: process.env.DATABASE_URL ?? null,
  fastApiBaseUrl: mlServiceUrl,
  mlServiceUrl,
  demoMode,
  corsOrigins,
  databaseEnvironment: process.env.DATABASE_ENV ?? null,
  jwtSecret: process.env.JWT_SECRET ?? (isProduction ? '' : 'development-secret'),
};

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535');
}

if (isProduction && !env.jwtSecret) {
  throw new Error('JWT_SECRET is required in production');
}

export const isDatabaseConfigured = Boolean(env.databaseUrl);
