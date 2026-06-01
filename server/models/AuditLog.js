const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  adminName: { type: String, required: true },
  adminEmail: { type: String, required: true },
  action: { type: String, required: true }, // e.g. 'UPDATE_USER_ROLE', 'SUSPEND_USER'
  resource: { type: String, required: true }, // e.g. 'User', 'Membership', 'Order'
  resourceId: { type: String },
  changes: { type: mongoose.Schema.Types.Mixed }, // { before, after }
  ip: { type: String },
  userAgent: { type: String },
  status: { type: String, enum: ['success', 'failed'], default: 'success' },
  createdAt: { type: Date, default: Date.now, index: true },
});

auditLogSchema.index({ adminId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, resourceId: 1 });

// TTL: auto-delete logs older than 1 year
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 365 * 86400 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
