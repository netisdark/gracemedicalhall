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

      // Skip checking date if expiryDate is string-based, or handle accordingly
      // Since expiryDate is now a String, we can optionally parse/compare it if it's a date string,
      // but let's check if it's an invalid date or expired. Let's do a loose check:
      const expDate = new Date(medicine.expiryDate);
      if (!isNaN(expDate.getTime()) && expDate <= now) {
        throw new AppError(`Cannot sell "${medicine.description}" (Batch: ${medicine.batch}) - it has expired.`, 400);
      }

      if (medicine.qty < item.quantity) {
        throw new AppError(`Insufficient stock for "${medicine.description}". Available: ${medicine.qty}, Requested: ${item.quantity}`, 400);
      }

      // Deduct stock
      medicine.qty -= item.quantity;
      await medicine.save({ session });

      const priceAtSale = Number(item.price) || medicine.mrp;
      const discountAtSale = Number(item.discount) !== undefined ? Number(item.discount) : (medicine.discount || 0);
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
      .populate('items.medicine', 'description pack batch expiryDate')
      .populate('soldBy', 'username');
  }

  async getSalesHistory(limit = 100, skip = 0) {
    return Sale.find()
      .populate('items.medicine', 'description pack batch')
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
