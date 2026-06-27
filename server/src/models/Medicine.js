import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  batchNo: {
    type: String,
    required: true,
    trim: true
  },
  productionDate: {
    type: Date,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true,
    index: true
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    index: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

// Compound unique index on name + batchNo
medicineSchema.index({ name: 1, batchNo: 1 }, { unique: true });

// Text index on name for autocomplete search
medicineSchema.index({ name: 'text' });

const Medicine = mongoose.model('Medicine', medicineSchema);
export default Medicine;
