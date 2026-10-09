import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller.js';
import { inventoryController } from '../controllers/inventory.controller.js';
import { recommendationController } from '../controllers/recommendation.controller.js';

export const apiRoutes = Router();

apiRoutes.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'zerowaste-backend' });
});

apiRoutes.get('/dashboard/summary', dashboardController.getSummary);
apiRoutes.get('/inventory', inventoryController.list);
apiRoutes.get('/inventory/expiry-alerts', inventoryController.getExpiryAlerts);
apiRoutes.get('/recommendations', recommendationController.list);
apiRoutes.post('/recommendations/generate', recommendationController.generate);
apiRoutes.patch('/recommendations/:id/approve', recommendationController.approve);
apiRoutes.patch('/recommendations/:id/reject', recommendationController.reject);
