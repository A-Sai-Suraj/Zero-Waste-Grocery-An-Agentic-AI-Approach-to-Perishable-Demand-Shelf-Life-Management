import { Router } from 'express';
import { asyncHandler } from '../lib/async-handler.js';
import { auditController } from '../controllers/audit.controller.js';
import { catalogController } from '../controllers/catalog.controller.js';
import { dashboardController } from '../controllers/dashboard.controller.js';
import { forecastController } from '../controllers/forecast.controller.js';
import { healthController } from '../controllers/health.controller.js';
import { ingestionController } from '../controllers/ingestion.controller.js';
import { inventoryController } from '../controllers/inventory.controller.js';
import { recommendationController } from '../controllers/recommendation.controller.js';
import { productionWriteGate, plannerAuthorization } from '../middleware/planner-authorization.js';

export const apiRoutes = Router();

apiRoutes.get('/health', asyncHandler(healthController.getHealth));

apiRoutes.get('/stores', asyncHandler(catalogController.stores));
apiRoutes.get('/products', asyncHandler(catalogController.products));
apiRoutes.get('/dashboard/summary', asyncHandler(dashboardController.getSummary));
apiRoutes.get('/alerts', asyncHandler(inventoryController.getExpiryAlerts));
apiRoutes.get('/inventory', asyncHandler(inventoryController.list));
apiRoutes.get('/inventory/:batchId', asyncHandler(inventoryController.getByBatchId));
apiRoutes.post('/inventory/ingest', productionWriteGate, asyncHandler(inventoryController.ingestInventory));

apiRoutes.post('/ingestion/sales', productionWriteGate, asyncHandler(ingestionController.ingestSales));
apiRoutes.post('/ingestion/inventory', productionWriteGate, asyncHandler(ingestionController.ingestInventory));
apiRoutes.post('/ingestion/receipts', productionWriteGate, asyncHandler(ingestionController.ingestReceipt));
apiRoutes.post('/ingestion/promotions', productionWriteGate, asyncHandler(ingestionController.ingestPromotion));
apiRoutes.post('/ingestion/waste', productionWriteGate, asyncHandler(ingestionController.ingestWaste));

apiRoutes.get('/forecasts', asyncHandler(forecastController.list));
apiRoutes.post('/forecasts/generate', productionWriteGate, asyncHandler(forecastController.generate));
apiRoutes.get('/spoilage', asyncHandler(inventoryController.getStoredSpoilageRisks));
apiRoutes.post('/spoilage/predict', productionWriteGate, asyncHandler(forecastController.generateSpoilageRisk));
apiRoutes.get('/recommendations', asyncHandler(recommendationController.list));
apiRoutes.get('/recommendations/:id', asyncHandler(recommendationController.getById));
apiRoutes.post('/recommendations/generate', plannerAuthorization, asyncHandler(recommendationController.generate));
apiRoutes.patch('/recommendations/:id/approve', plannerAuthorization, asyncHandler(recommendationController.approve));
apiRoutes.patch('/recommendations/:id/reject', plannerAuthorization, asyncHandler(recommendationController.reject));
apiRoutes.patch('/recommendations/:id/modify', plannerAuthorization, asyncHandler(recommendationController.modify));
apiRoutes.post('/recommendations/:id/execute', plannerAuthorization, asyncHandler(recommendationController.execute));
apiRoutes.get('/audit-logs', asyncHandler(auditController.list));
