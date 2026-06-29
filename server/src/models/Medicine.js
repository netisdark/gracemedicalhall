import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema({
  sn: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  pack: { type: String, required: true, trim: true },
  batch: { type: String, required: true, trim: true },
  productionDate: { type: Date, required: true },
  expiryDate: { type: Date, required: true, index: true },
  qty: { type: Number, required: true, min: 0, index: true },
  costRate: { type: Number, required: true, min: 0 },
  amount: { type: Number, required: true, min: 0 },
  mrp: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0, min: 0, max: 100 },
  remarks: { type: String, trim: true }
}, { timestamps: true });

// Unique index on SN + batch
medicineSchema.index({ sn: 1, batch: 1 }, { unique: true });

// Text index for search on description, pack, and remarks
medicineSchema.index({ description: 'text', pack: 'text', remarks: 'text' });

const Medicine = mongoose.model('Medicine', medicineSchema);
export default Medicine;
