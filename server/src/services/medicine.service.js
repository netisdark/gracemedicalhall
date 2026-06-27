import Medicine from '../models/Medicine.js';
import { AppError } from '../middleware/errorHandler.js';
import auditService from './audit.service.js';

class MedicineService {
  async getMedicines(params = {}) {
    const { search, filter, limit = 50, skip = 0 } = params;
    const query = {};

    // Filter rules
    if (filter === 'lowStock') {
      query.stock = { $lte: 10 };
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

      // Regex fallback for partial matching on name/company if text search returned nothing
      if (medicines.length === 0) {
        delete query.$text;
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { company: { $regex: search, $options: 'i' } }
        ];
        medicines = await Medicine.find(query)
          .sort({ name: 1 })
          .limit(Number(limit))
          .skip(Number(skip));
      }
    } else {
      medicines = await Medicine.find(query)
        .sort({ name: 1 })
        .limit(Number(limit))
        .skip(Number(skip));
    }

    const total = await Medicine.countDocuments(query);

    return {
      medicines,
      total
    };
  }

  async getMedicineById(id) {
    const medicine = await Medicine.findById(id);
    if (!medicine) {
      throw new AppError('Medicine not found', 404);
    }
    return medicine;
  }

  async createMedicine(data, userId) {
    const existing = await Medicine.findOne({ name: data.name, batchNo: data.batchNo });
    if (existing) {
      throw new AppError(`Medicine "${data.name}" with Batch No "${data.batchNo}" already exists.`, 400);
    }

    const medicine = new Medicine(data);
    await medicine.save();

    await auditService.log(userId, 'create', 'Medicine', medicine._id, `Added: ${medicine.name} (Batch: ${medicine.batchNo})`);
    return medicine;
  }

  async updateMedicine(id, data, userId) {
    if (data.name || data.batchNo) {
      const medicine = await this.getMedicineById(id);
      const name = data.name || medicine.name;
      const batchNo = data.batchNo || medicine.batchNo;

      const existing = await Medicine.findOne({ name, batchNo, _id: { $ne: id } });
      if (existing) {
        throw new AppError(`Another medicine "${name}" with Batch No "${batchNo}" already exists.`, 400);
      }
    }

    const updated = await Medicine.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!updated) {
      throw new AppError('Medicine not found', 404);
    }

    await auditService.log(userId, 'update', 'Medicine', updated._id, `Updated: ${updated.name}`);
    return updated;
  }

  async deleteMedicine(id, userId) {
    const medicine = await Medicine.findByIdAndDelete(id);
    if (!medicine) {
      throw new AppError('Medicine not found', 404);
    }

    await auditService.log(userId, 'delete', 'Medicine', id, `Deleted: ${medicine.name} (Batch: ${medicine.batchNo})`);
    return medicine;
  }
}

export const medicineService = new MedicineService();
export default medicineService;
