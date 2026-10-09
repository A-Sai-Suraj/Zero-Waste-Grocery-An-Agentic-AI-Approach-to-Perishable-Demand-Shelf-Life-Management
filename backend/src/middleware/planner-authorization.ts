import type { RequestHandler } from 'express';
import { env } from '../config/env.js';

export function createProductionWriteGate(environment: () => string = () => env.nodeEnv): RequestHandler {
  return (_req, res, next) => {
    if (environment() === 'production') {
      res.status(503).json({ error: 'Write operations are disabled until authentication is configured' });
      return;
    }
    next();
  };
}

export const productionWriteGate = createProductionWriteGate();
export const plannerAuthorization = productionWriteGate;
