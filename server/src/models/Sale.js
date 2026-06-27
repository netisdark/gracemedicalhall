import mongoose from 'mongoose';

const saleItemSchema = new mongoose.Schema({
  medicine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    required: true,
    index: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  priceAtSale: {
    type: Number,
    required: true,
    min: 0
  },
  discountAtSale: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
});

const saleSchema = new mongoose.Schema({
  items: [saleItemSchema],
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Card', 'Fonepay'],
    required: true
  },
  soldBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

saleSchema.index({ createdAt: -1 });

const Sale = mongoose.model('Sale', saleSchema);
export default Sale;
