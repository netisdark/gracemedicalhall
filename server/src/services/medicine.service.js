import Medicine from '../models/Medicine.js';
import { AppError } from '../middleware/errorHandler.js';
import auditService from './audit.service.js';

class MedicineService {
  async getMedicines(params = {}) {
    const { search, filter, limit = 50, skip = 0 } = params;
    const query = {};

    // Filter rules
    if (filter === 'lowStock') {
      query.qty = { $lte: 10 };
    } else if (filter === 'expiringSoon') {
      const now = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(now.getDate() + 30);
      query.expiryDate = { $gte: now, $lte: thirtyDaysFromNow };
    } else if (filter === 'expired') {
      query.expiryDate = { $lt: new Date() };
    }

    let medicines;
    if (search) {
      // Try text index search first
      query.$text = { $search: search };
      medicines = await Medicine.find(query)
        .select({ score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })
        .limit(Number(limit))
        .skip(Number(skip));

      // Regex fallback for partial matching on description/pack
      if (medicines.length === 0) {
        delete query.$text;
        query.$or = [
          { description: { $regex: search, $options: 'i' } },
          { pack: { $regex: search, $options: 'i' } },
          { sn: { $regex: search, $options: 'i' } }
        ];
        medicines = await Medicine.find(query)
          .sort({ description: 1 })
          .limit(Number(limit))
          .skip(Number(skip));
      }
    } else {
      medicines = await Medicine.find(query)
        .sort({ description: 1 })
        .limit(Number(limit))
        .skip(Number(skip));
    }

    const total = await Medicine.countDocuments(query);

    return { medicines, total };
  }

  async getMedicineById(id) {
    const medicine = await Medicine.findById(id);
    if (!medicine) {
      throw new AppError('Medicine not found', 404);
    }
    return medicine;
  }

  async createMedicine(data, userId) {
    const existing = await Medicine.findOne({ sn: data.sn, batch: data.batch });
    if (existing) {
      throw new AppError(`Medicine SN "${data.sn}" with Batch "${data.batch}" already exists.`, 400);
    }

    const medicine = new Medicine(data);
    await medicine.save();

    await auditService.log(userId, 'create', 'Medicine', medicine._id, `Added: ${medicine.description} (Batch: ${medicine.batch})`);
    return medicine;
  }

  async updateMedicine(id, data, userId) {
    if (data.sn || data.batch) {
      const medicine = await this.getMedicineById(id);
      const sn = data.sn || medicine.sn;
      const batch = data.batch || medicine.batch;

      const existing = await Medicine.findOne({ sn, batch, _id: { $ne: id } });
      if (existing) {
        throw new AppError(`Another medicine with SN "${sn}" and Batch "${batch}" already exists.`, 400);
      }
    }

    const updated = await Medicine.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!updated) {
      throw new AppError('Medicine not found', 404);
    }

    await auditService.log(userId, 'update', 'Medicine', updated._id, `Updated: ${updated.description}`);
    return updated;
  }

  async deleteMedicine(id, userId) {
    const medicine = await Medicine.findByIdAndDelete(id);
    if (!medicine) {
      throw new AppError('Medicine not found', 404);
    }

    await auditService.log(userId, 'delete', 'Medicine', id, `Deleted: ${medicine.description} (Batch: ${medicine.batch})`);
    return medicine;
  }
}

export const medicineService = new MedicineService();
export default medicineService;

