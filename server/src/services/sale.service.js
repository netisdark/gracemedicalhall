import mongoose from 'mongoose';
import Sale from '../models/Sale.js';
import Medicine from '../models/Medicine.js';
import { AppError } from '../middleware/errorHandler.js';
import auditService from './audit.service.js';

class SaleService {
  async checkout(userId, saleData) {
    const { items, paymentMethod } = saleData;
    const now = new Date();

    let session = null;
    try {
      session = await mongoose.startSession();
      session.startTransaction();

      const result = await this._processCheckout(userId, items, paymentMethod, now, session);

      await session.commitTransaction();
      session.endSession();
      return result;
    } catch (error) {
      if (session) {
        try {
          if (session.inTransaction()) {
            await session.abortTransaction();
          }
        } catch (abortError) {
          console.error('Failed to abort transaction:', abortError);
        }
        session.endSession();
      }

      // Check if error is related to lack of replica set support for transactions
      const isTxUnsupported = error.message.includes('Transaction numbers are only allowed') ||
                              error.message.includes('ReplicaSetNoPrimary') ||
                              error.code === 251 || // NoSuchTransaction
                              error.code === 20;    // IllegalOperation

      if (isTxUnsupported) {
        console.warn('Transactions not supported by MongoDB instance. Falling back to sequential execution.');
        return this._processCheckout(userId, items, paymentMethod, now);
      }

      throw error;
    }
  }

  async _processCheckout(userId, items, paymentMethod, now, session = null) {
    const saleItems = [];
    let totalPrice = 0;

    for (const item of items) {
      const medicine = await Medicine.findById(item.medicineId).session(session);
      if (!medicine) {
        throw new AppError(`Medicine with ID ${item.medicineId} not found`, 404);
      }

      if (medicine.expiryDate <= now) {
        throw new AppError(`Cannot sell "${medicine.name}" (Batch: ${medicine.batchNo}) - it has expired.`, 400);
      }

      if (medicine.stock < item.quantity) {
        throw new AppError(`Insufficient stock for "${medicine.name}". Available: ${medicine.stock}, Requested: ${item.quantity}`, 400);
      }

      // Deduct stock
      medicine.stock -= item.quantity;
      await medicine.save({ session });

      const priceAtSale = medicine.price;
      const discountAtSale = medicine.discount;
      const subtotal = priceAtSale * item.quantity;
      const discounted = subtotal * (1 - discountAtSale / 100);
      totalPrice += discounted;

      saleItems.push({
        medicine: medicine._id,
        quantity: item.quantity,
        priceAtSale,
        discountAtSale
      });
    }

    const sale = new Sale({
      items: saleItems,
      totalPrice: Math.round(totalPrice * 100) / 100,
      paymentMethod,
      soldBy: userId
    });
    await sale.save({ session });

    await auditService.log(userId, 'checkout', 'Sale', sale._id, `POS Checkout: Total NPR ${sale.totalPrice}`);

    return Sale.findById(sale._id)
      .populate('items.medicine', 'name company batchNo expiryDate')
      .populate('soldBy', 'username');
  }

  async getSalesHistory(limit = 100, skip = 0) {
    return Sale.find()
      .populate('items.medicine', 'name company batchNo')
      .populate('soldBy', 'username')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip));
  }

  async getSalesHistoryCount() {
    return Sale.countDocuments();
  }
}

export const saleService = new SaleService();
export default saleService;
