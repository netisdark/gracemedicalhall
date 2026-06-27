import saleService from '../services/sale.service.js';

export const checkout = async (req, res, next) => {
  try {
    const sale = await saleService.checkout(req.user.id, req.body);
    res.status(201).json({
      success: true,
      data: sale,
      message: 'Transaction completed successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getSalesHistory = async (req, res, next) => {
  try {
    const { limit, skip } = req.query;
    const sales = await saleService.getSalesHistory(limit, skip);
    const total = await saleService.getSalesHistoryCount();
    res.status(200).json({
      success: true,
      data: {
        sales,
        total
      },
      message: 'Sales transaction history retrieved'
    });
  } catch (error) {
    next(error);
  }
};
