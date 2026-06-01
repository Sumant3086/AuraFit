const REQUIRED_VARS = [
  { key: 'MONGODB_URI', desc: 'MongoDB connection string' },
  { key: 'JWT_SECRET', desc: 'JWT access token secret (min 32 chars)' },
  { key: 'JWT_REFRESH_SECRET', desc: 'JWT refresh token secret (min 32 chars)' },
];

const RECOMMENDED_VARS = [
  { key: 'GOOGLE_API_KEY', desc: 'Google Gemini API for AI features' },
  { key: 'EMAIL_USER', desc: 'Gmail address for transactional emails' },
  { key: 'EMAIL_APP_PASSWORD', desc: 'Gmail App Password for SMTP' },
  { key: 'RAZORPAY_KEY_ID', desc: 'Razorpay Key ID for payments' },
  { key: 'RAZORPAY_KEY_SECRET', desc: 'Razorpay Key Secret for payments' },
  { key: 'RAZORPAY_WEBHOOK_SECRET', desc: 'Razorpay webhook signature verification' },
  { key: 'CLOUDINARY_CLOUD_NAME', desc: 'Cloudinary cloud name for media uploads' },
  { key: 'CLIENT_URL', desc: 'Frontend URL for CORS and links' },
  { key: 'REDIS_URL', desc: 'Redis URL for caching (optional but recommended)' },
];

function validateEnvironment() {
  const missing = [];
  const weak = [];
  const warnings = [];

  // Check required vars
  for (const { key, desc } of REQUIRED_VARS) {
    if (!process.env[key]) {
      missing.push(`  ❌ ${key}: ${desc}`);
    } else if (key.includes('SECRET') && process.env[key].length < 32) {
      weak.push(`  ⚠️  ${key}: Should be at least 32 characters for security`);
    }
  }

  // Check recommended vars
  for (const { key, desc } of RECOMMENDED_VARS) {
    if (!process.env[key]) {
      warnings.push(`  ⚠️  ${key}: ${desc}`);
    }
  }

  const isProd = process.env.NODE_ENV === 'production';

  if (missing.length > 0) {
    console.error('\n🚨 CRITICAL: Missing required environment variables:');
    missing.forEach(m => console.error(m));
    if (isProd) {
      console.error('\nServer cannot start in production without required variables.\n');
      process.exit(1);
    } else {
      console.warn('\n⚠️  Running in development with missing variables. Some features will not work.\n');
    }
  }

  if (weak.length > 0) {
    console.warn('\n🔒 Security warnings:');
    weak.forEach(w => console.warn(w));
  }

  if (warnings.length > 0 && !isProd) {
    console.info('\n💡 Optional features disabled (missing env vars):');
    warnings.forEach(w => console.info(w));
    console.info('');
  }

  if (missing.length === 0 && weak.length === 0) {
    console.log('✅ Environment validation passed');
  }
}

module.exports = { validateEnvironment };
