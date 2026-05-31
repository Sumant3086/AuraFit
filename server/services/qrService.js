const QRCode = require('qrcode');
const crypto = require('crypto');

// Generate a secure QR token for check-in
const generateCheckInToken = (userId, gymId) => {
  const timestamp = Date.now();
  const raw = `${userId}:${gymId || 'default'}:${timestamp}`;
  const token = crypto
    .createHmac('sha256', process.env.JWT_SECRET || 'aura_fit_qr_secret')
    .update(raw)
    .digest('hex');
  return { token, timestamp, userId, gymId };
};

// Verify a QR token (valid for 60 seconds)
const verifyCheckInToken = (token, userId, gymId, timestamp) => {
  const now = Date.now();
  if (now - parseInt(timestamp) > 60000) {
    return { valid: false, reason: 'QR code expired' };
  }
  const raw = `${userId}:${gymId || 'default'}:${timestamp}`;
  const expected = crypto
    .createHmac('sha256', process.env.JWT_SECRET || 'aura_fit_qr_secret')
    .update(raw)
    .digest('hex');
  if (token !== expected) {
    return { valid: false, reason: 'Invalid QR code' };
  }
  return { valid: true };
};

// Generate QR code as base64 data URL
const generateQRDataURL = async (data) => {
  try {
    const url = await QRCode.toDataURL(JSON.stringify(data), {
      width: 256,
      margin: 2,
      color: { dark: '#9d00ff', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    });
    return url;
  } catch (error) {
    console.error('[QR] Generation error:', error.message);
    throw error;
  }
};

// Generate member check-in QR (refreshes every 60s)
const generateMemberQR = async (userId, gymId) => {
  const payload = generateCheckInToken(userId, gymId);
  const qrDataURL = await generateQRDataURL(payload);
  return { qrDataURL, expiresAt: payload.timestamp + 60000, token: payload.token };
};

module.exports = { generateMemberQR, generateCheckInToken, verifyCheckInToken, generateQRDataURL };
