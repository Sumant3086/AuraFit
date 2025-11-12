const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');

// EDIT THESE VALUES to add your user
const YOUR_USER = {
  name: 'Your Name',           // Change this
  email: 'your@email.com',     // Change this
  password: 'yourpassword',    // Change this
  phone: '9876543210',         // Change this
  membership: 'Premium'        // Change this (None/Basic/Pro/Premium)
};

async function addYourUser() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB connected!\n');
    
    // Check if user exists
    const existingUser = await User.findOne({ email: YOUR_USER.email });
    if (existingUser) {
      console.log(`⚠️  User ${YOUR_USER.email} already exists!`);
      console.log('   Edit the email in quickAddUser.js to add a different user.');
      process.exit(0);
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(YOUR_USER.password, 10);
    
    // Create user
    const user = new User({
      name: YOUR_USER.name,
      email: YOUR_USER.email,
      password: hashedPassword,
      phone: YOUR_USER.phone,
      membership: YOUR_USER.membership,
      status: 'Active',
      role: 'user'
    });
    
    await user.save();
    
    console.log('✅ User added successfully!');
    console.log(`   ID: ${user._id}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Membership: ${user.membership}`);
    console.log(`\n💡 You can now login with:`);
    console.log(`   Email: ${YOUR_USER.email}`);
    console.log(`   Password: ${YOUR_USER.password}`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

addYourUser();
