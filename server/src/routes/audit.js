import express from 'express';
import auditService from '../services/audit.service.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Only admins can view audit logs
router.use(authMiddleware, adminMiddleware);

router.get('/', async (req, res, next) => {
  try {
    const { action, collectionName, dateFrom, dateTo, limit, skip } = req.query;
    const result = await auditService.getLogs({ action, collectionName, dateFrom, dateTo, limit, skip });
    res.status(200).json({
      success: true,
      data: result,
      message: 'Audit logs retrieved'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
