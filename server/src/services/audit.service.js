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
}

export const auditService = new AuditService();
export default auditService;
