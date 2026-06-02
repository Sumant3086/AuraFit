/**
 * One-time admin account setup script.
 *
 * Run ONCE to create the admin user in MongoDB:
 *   cd server
 *   node scripts/createAdmin.js
 *
 * Reads credentials from server/.env — never hardcoded in source.
 * Safe to run again: will update the existing account, not duplicate it.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  // Validate required env vars
  const required = ['MONGODB_URI', 'ADMIN_EMAIL', 'ADMIN_SETUP_PASSWORD', 'ADMIN_NAME'];
  const missing = required.filter(k => !process.env[k]);
  if (missing.length) {
    console.error('❌ Missing required env vars:', missing.join(', '));
    console.error('   Add them to server/.env before running this script.');
    process.exit(1);
  }

  const email    = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_SETUP_PASSWORD;
  const name     = process.env.ADMIN_NAME;

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Inline schema to avoid circular dep issues
    const User = require('../models/User');

    const hashed = await bcrypt.hash(password, 12);
    const admin = await User.findOneAndUpdate(
      { email },
      {
        $set: {
          name,
          email,
          password: hashed,
          role: 'admin',
          status: 'Active',
          onboardingCompleted: true,
        },
      },
      { upsert: true, new: true, runValidators: false }
    );

    console.log('');
    console.log('✅ Admin account ready');
    console.log('   Email:', email);
    console.log('   Name: ', name);
    console.log('   Role: ', admin.role);
    console.log('   ID:   ', admin._id.toString());
    console.log('');
    console.log('Login at: /admin/login');
    console.log('');
    console.log('⚠️  You can remove ADMIN_SETUP_PASSWORD from .env now.');
    console.log('   The admin user is stored with a bcrypt hash in MongoDB.');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

createAdmin();
