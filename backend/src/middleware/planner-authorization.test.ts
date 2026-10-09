import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createProductionWriteGate } from './planner-authorization.js';

describe('planner authorization safety gate', () => {
  it('blocks planner mutations in production when no identity provider is configured', async () => {
    const app = express();
    app.patch('/decision', createProductionWriteGate(() => 'production'), (_req, res) => res.sendStatus(204));
    const response = await request(app).patch('/decision');
    expect(response.status).toBe(503);
    expect(response.body.error).toMatch(/authentication is configured/i);
  });

  it('keeps local development usable but does not treat actor IDs as authentication', async () => {
    const app = express();
    app.patch('/decision', createProductionWriteGate(() => 'development'), (_req, res) => res.sendStatus(204));
    expect((await request(app).patch('/decision')).status).toBe(204);
  });
});
