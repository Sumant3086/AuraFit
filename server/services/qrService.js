const QRCode = require('qrcode');
const crypto = require('crypto');

// Use JWT_SECRET as the HMAC key for QR tokens — must be set in environment
const getQRSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET must be set to generate QR codes');
  return secret;
};

// Generate a secure QR token for check-in (valid 60 seconds)
const generateCheckInToken = (userId, gymId) => {
  const timestamp = Date.now();
  const raw = `${userId}:${gymId || 'default'}:${timestamp}`;
  const token = crypto
    .createHmac('sha256', getQRSecret())
    .update(raw)
    .digest('hex');
  return { token, timestamp, userId, gymId };
};

// Verify a QR token
const verifyCheckInToken = (token, userId, gymId, timestamp) => {
  const now = Date.now();
  if (now - parseInt(timestamp) > 60000) {
    return { valid: false, reason: 'QR code expired' };
  }
  const raw = `${userId}:${gymId || 'default'}:${timestamp}`;
  const expected = crypto
    .createHmac('sha256', getQRSecret())
    .update(raw)
    .digest('hex');
  return token === expected
    ? { valid: true }
    : { valid: false, reason: 'Invalid QR code' };
};

// Generate QR code as base64 data URL
const generateQRDataURL = async (data) => {
  return QRCode.toDataURL(JSON.stringify(data), {
    width: 256,
    margin: 2,
    color: { dark: '#9d00ff', light: '#ffffff' },
    errorCorrectionLevel: 'M',
  });
};

// Generate member check-in QR (refreshes every 60s)
const generateMemberQR = async (userId, gymId) => {
  const payload = generateCheckInToken(userId, gymId);
  const qrDataURL = await generateQRDataURL(payload);
  return { qrDataURL, expiresAt: payload.timestamp + 60000, token: payload.token };
};

module.exports = { generateMemberQR, generateCheckInToken, verifyCheckInToken, generateQRDataURL };
