import { Router } from 'express';
import mapController from '../controllers/map.controller';
import { requireAuth, isVendor } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validateRequest.middleware';
import { UpdateLocationDTO } from '../dtos/location.dto';

const mapRouter = Router();

mapRouter.get('/nearby', mapController.getNearbyVendors);

mapRouter.patch(
  '/vendor/:vendorId/location',
  requireAuth,
  isVendor,
  validateRequest(UpdateLocationDTO),
  mapController.updateVendorLocation
);

export default mapRouter;