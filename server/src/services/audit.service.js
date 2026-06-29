import AuditLog from '../models/AuditLog.js';

class AuditService {
  async log(userId, action, collectionName, recordId = null, details = '') {
    try {
      const log = new AuditLog({
        user: userId,
        action,
        collectionName,
        recordId,
        details
      });
      await log.save();
      return log;
    } catch (error) {
      console.error('Failed to write audit log:', error);
    }
  }

  async getRecentLogs(limit = 15) {
    return AuditLog.find()
      .populate('user', 'username role')
      .sort({ timestamp: -1 })
      .limit(limit);
  }

  // Filtered query for audit logs page
  async getLogs({ action, collectionName, dateFrom, dateTo, limit = 100, skip = 0 } = {}) {
    const query = {};
    if (action) query.action = action;
    if (collectionName) query.collectionName = collectionName;
    if (dateFrom || dateTo) {
      query.timestamp = {};
      if (dateFrom) query.timestamp.$gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        query.timestamp.$lte = end;
      }
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .populate('user', 'username role')
        .sort({ timestamp: -1 })
        .limit(Number(limit))
        .skip(Number(skip)),
      AuditLog.countDocuments(query)
    ]);

    return { logs, total };
  }
}

export const auditService = new AuditService();
export default auditService;

