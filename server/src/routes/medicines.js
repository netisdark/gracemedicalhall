import express from 'express';
import { getMedicines, getMedicineById, createMedicine, updateMedicine, deleteMedicine } from '../controllers/medicine.controller.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { MedicineSchema, MedicineUpdateSchema } from '../../shared/validation.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getMedicines);
router.get('/:id', getMedicineById);

// Admin restrictions for editing inventory records
router.post('/', adminMiddleware, validateRequest(MedicineSchema), createMedicine);
router.put('/:id', adminMiddleware, validateRequest(MedicineUpdateSchema), updateMedicine);
router.delete('/:id', adminMiddleware, deleteMedicine);

export default router;
