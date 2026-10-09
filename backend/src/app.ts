import cors from 'cors';
import express from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { env } from './config/env.js';
import { createCorsOriginCallback } from './config/cors.js';
import prisma from './config/prisma.js';
import { HttpError } from './lib/errors.js';
import { apiRoutes } from './routes/index.js';
import { healthController } from './controllers/health.controller.js';
import { asyncHandler } from './lib/async-handler.js';

const app = express();

app.use(cors({
  origin: createCorsOriginCallback(env.corsOrigins),
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use('/api/v1', apiRoutes);

app.get('/health', asyncHandler(healthController.getHealth));

app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  let statusCode = 500;
  let message = 'Server error';
  let details: unknown;
  if (error instanceof HttpError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error instanceof ZodError) {
    statusCode = 400;
    message = 'Invalid request';
    details = error.issues;
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      statusCode = 409;
      message = 'A record with the same unique key already exists';
    } else if (error.code === 'P2003') {
      statusCode = 400;
      message = 'A referenced store, product or batch does not exist';
    } else if (error.code === 'P2025') {
      statusCode = 404;
      message = 'Record not found';
    } else if (error.code === 'P2034') {
      statusCode = 409;
      message = 'Transaction conflicted; retry the request';
    } else if (['P1000', 'P1001', 'P1002', 'P1008', 'P1017', 'P2024', 'P2028'].includes(error.code)) {
      statusCode = 503;
      message = 'Database is unavailable';
    }
  } else if (error instanceof Prisma.PrismaClientInitializationError) {
    statusCode = 503;
    message = 'Database is unavailable';
  } else if (error instanceof Prisma.PrismaClientRustPanicError) {
    statusCode = 503;
    message = 'Database client failed';
  } else if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = error.status;
    if (typeof status === 'number' && status >= 400 && status < 600) {
      statusCode = status;
      message = status === 400 ? 'Invalid request body' : status === 413 ? 'Request body too large' : message;
    }
  }
  if (statusCode >= 500) {
    console.error('Unhandled backend error', error instanceof Error ? error.name : 'UnknownError');
  }
  res.status(statusCode).json({
    error: message,
    ...(details ? { details } : {}),
  });
});

export default app;
