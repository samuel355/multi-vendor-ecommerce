import { Router } from 'express';
import { requireAuth, isAdmin } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validateRequest.middleware';
import { 
  UpdateVendorStatusDTO, 
  CreateAnnouncementDTO 
} from '../dtos/admin.dto';
import adminContoller from '../controllers/admin.contoller';

const adminRouter = Router();

// Apply admin middleware to all routes
adminRouter.use(requireAuth, isAdmin);

// Analytics and Reporting
adminRouter.get('/admin/analytics/vendors', adminContoller.getVendorAnalytics);
adminRouter.get('/admin/vendors', adminContoller.getVendors);
adminRouter.get('/admin/vendors/:vendorId/metrics', adminContoller.getVendorMetrics);

// Vendor Management
adminRouter.patch(
  '/admin/vendors/:vendorId/status',
  validateRequest(UpdateVendorStatusDTO),
  adminContoller.updateVendorStatus
);

// Communications
adminRouter.post(
  '/admin/announcements',
  validateRequest(CreateAnnouncementDTO),
  adminContoller.createAnnouncement
);

export default adminRouter;