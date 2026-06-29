import Sale from '../models/Sale.js';
import Medicine from '../models/Medicine.js';
import auditService from '../services/audit.service.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();

    // 1. Sales Today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const salesTodayObj = await Sale.aggregate([
      { $match: { createdAt: { $gte: startOfDay } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' }, count: { $sum: 1 } } }
    ]);
    const salesToday = salesTodayObj.length > 0 ? salesTodayObj[0].total : 0;
    const transactionsToday = salesTodayObj.length > 0 ? salesTodayObj[0].count : 0;

    // 2. Monthly Revenue
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const salesMonthObj = await Sale.aggregate([
      { $match: { createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    const monthlyRevenue = salesMonthObj.length > 0 ? salesMonthObj[0].total : 0;

    // 3. Low Stock Alerts (stock <= 10)
    const lowStockCount = await Medicine.countDocuments({ qty: { $lte: 10 } });
    const lowStockList = await Medicine.find({ qty: { $lte: 10 } })
      .select('description batch qty mrp')
      .limit(5);

    // 4. Expiry Alerts (< 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);
    const expiringSoonCount = await Medicine.countDocuments({
      expiryDate: { $gte: now, $lte: thirtyDaysFromNow }
    });
    const expiredCount = await Medicine.countDocuments({
      expiryDate: { $lt: now }
    });
    const expiringSoonList = await Medicine.find({
      expiryDate: { $gte: now, $lte: thirtyDaysFromNow }
    })
      .select('description batch expiryDate qty')
      .sort({ expiryDate: 1 })
      .limit(5);

    // 5. Recent Activity Logs
    const recentActivity = await auditService.getRecentLogs(10);

    // 6. Sales Last 7 Days (Chart Aggregation)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const salesLast7DaysAgg = await Sale.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalPrice' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Build complete last 7 days list with zero-filled days for the graph
    const chartData = [];
    for (let i = 0; i < 7; i++) {
      const dateObj = new Date();
      dateObj.setDate(now.getDate() - (6 - i));
      const dateString = dateObj.toISOString().split('T')[0];

      const dayData = salesLast7DaysAgg.find(item => item._id === dateString);
      chartData.push({
        date: dateString,
        formattedDate: dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        revenue: dayData ? Math.round(dayData.revenue * 100) / 100 : 0,
        count: dayData ? dayData.count : 0
      });
    }

    // 7. Top Selling Medicines
    const topSelling = await Sale.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.medicine',
          quantitySold: { $sum: '$items.quantity' },
          revenue: {
            $sum: {
              $multiply: [
                '$items.priceAtSale',
                '$items.quantity',
                { $subtract: [1, { $divide: ['$items.discountAtSale', 100] }] }
              ]
            }
          }
        }
      },
      { $sort: { quantitySold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'medicines',
          localField: '_id',
          foreignField: '_id',
          as: 'medicine'
        }
      },
      { $unwind: '$medicine' },
      {
        $project: {
          _id: 1,
          quantitySold: 1,
          revenue: { $round: ['$revenue', 2] },
          name: '$medicine.description',
          batch: '$medicine.batch'
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          salesToday,
          transactionsToday,
          monthlyRevenue,
          lowStockCount,
          expiringSoonCount,
          expiredCount
        },
        lowStockList,
        expiringSoonList,
        recentActivity,
        chartData,
        topSelling
      },
      message: 'Dashboard analytics retrieved'
    });
  } catch (error) {
    next(error);
  }
};
