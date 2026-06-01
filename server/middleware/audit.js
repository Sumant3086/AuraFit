const AuditLog = require('../models/AuditLog');

function parseUserAgent(ua = '') {
  let browser = 'Unknown';
  let os = 'Unknown';
  let deviceType = 'unknown';

  if (/Chrome/.test(ua) && !/Chromium/.test(ua)) browser = 'Chrome';
  else if (/Firefox/.test(ua)) browser = 'Firefox';
  else if (/Safari/.test(ua) && !/Chrome/.test(ua)) browser = 'Safari';
  else if (/Edge/.test(ua)) browser = 'Edge';

  if (/Windows/.test(ua)) os = 'Windows';
  else if (/Mac/.test(ua)) os = 'macOS';
  else if (/Linux/.test(ua)) os = 'Linux';
  else if (/Android/.test(ua)) os = 'Android';
  else if (/iOS|iPhone|iPad/.test(ua)) os = 'iOS';

  if (/Mobile|Android|iPhone/.test(ua)) deviceType = 'mobile';
  else if (/iPad|Tablet/.test(ua)) deviceType = 'tablet';
  else deviceType = 'desktop';

  return { browser, os, deviceType };
}

// Middleware factory: creates an audit log entry after an admin action succeeds
function auditAction(action, resource, getResourceId = () => null, getChanges = () => null) {
  return async (req, res, next) => {
    // Capture original json method
    const originalJson = res.json.bind(res);

    res.json = async function (body) {
      // Only log if the request succeeded
      if (res.statusCode < 400 && req.user) {
        try {
          await AuditLog.create({
            adminId: req.user._id,
            adminName: req.user.name,
            adminEmail: req.user.email,
            action,
            resource,
            resourceId: String(getResourceId(req, body) || req.params.id || ''),
            changes: getChanges(req, body),
            ip: req.ip || req.connection?.remoteAddress,
            userAgent: req.headers['user-agent'],
            status: 'success',
          });
        } catch (err) {
          // Don't let audit log failure break the response
          console.error('Audit log error:', err.message);
        }
      }
      return originalJson(body);
    };

    next();
  };
}

// Direct log function (for use inside route handlers)
async function logAction(adminUser, action, resource, resourceId, changes, req) {
  try {
    await AuditLog.create({
      adminId: adminUser._id,
      adminName: adminUser.name,
      adminEmail: adminUser.email,
      action,
      resource,
      resourceId: String(resourceId || ''),
      changes,
      ip: req?.ip || req?.connection?.remoteAddress,
      userAgent: req?.headers?.['user-agent'],
      status: 'success',
    });
  } catch (err) {
    console.error('Audit log error:', err.message);
  }
}

module.exports = { auditAction, logAction, parseUserAgent };
