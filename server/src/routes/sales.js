import express from 'express';
import { checkout, getSalesHistory } from '../controllers/sale.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { SaleSchema } from '../../shared/validation.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', validateRequest(SaleSchema), checkout);
router.get('/', getSalesHistory);

export default router;
