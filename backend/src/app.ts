import cors from 'cors';
import express from 'express';
import { apiRoutes } from './routes/index.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', apiRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'zerowaste-backend', timestamp: new Date().toISOString() });
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

export default app;
