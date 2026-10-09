import axios from 'axios';
import { z } from 'zod';
import { env } from '../config/env.js';
import { HttpError } from '../lib/errors.js';

const forecastResponseSchema = z.object({
  store_id: z.string().min(1),
  product_id: z.string().min(1),
  forecast_qty: z.number().finite().nonnegative(),
  confidence: z.number().finite().min(0).max(1),
  horizon_days: z.number().int().min(1).max(30),
  model_name: z.string().min(1),
}).strict();

const spoilageResponseSchema = z.object({
  batch_id: z.string().min(1),
  risk_score: z.number().finite().min(0).max(100),
  risk_level: z.enum(['low', 'medium', 'high']),
  days_to_expiry: z.number().int().nonnegative(),
  model_name: z.string().min(1),
}).strict();

function handleMlError(error: unknown, operation: string): never {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      throw new HttpError(`${operation} request timed out`, 504);
    }
    if (error.response) {
      throw new HttpError(`${operation} service returned an error`, 502);
    }
    throw new HttpError(`${operation} service is unavailable`, 503);
  }
  if (error instanceof z.ZodError) {
    throw new HttpError(`${operation} service returned an invalid response`, 502);
  }
  throw error;
}

export function createMlAdapter(baseUrl: string, timeout = 5000) {
  const client = axios.create({
    baseURL: baseUrl,
    timeout,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  });
  return {
    async requestForecast(payload: {
      store_id: string;
      product_id: string;
      horizon_days: number;
      features: Record<string, unknown>;
    }) {
      try {
        const response = await client.post('/api/forecast/demand', payload);
        return forecastResponseSchema.parse(response.data);
      } catch (error: unknown) {
        return handleMlError(error, 'Forecast');
      }
    },
    async requestSpoilageRisk(payload: {
      batch_id: string;
      inventory_qty: number;
      days_to_expiry: number;
      product_id: string;
      store_id: string;
    }) {
      try {
        const response = await client.post('/api/spoilage/risk', payload);
        return spoilageResponseSchema.parse(response.data);
      } catch (error: unknown) {
        return handleMlError(error, 'Spoilage risk');
      }
    },
  };
}

const adapter = createMlAdapter(env.fastApiBaseUrl);
export const requestForecast = adapter.requestForecast;
export const requestSpoilageRisk = adapter.requestSpoilageRisk;
