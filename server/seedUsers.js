const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

// Import User model
const User = require('./models/User');

// Sample users to add
const sampleUsers = [
  {
    name: 'Aarav Kumar',
    email: 'aarav@example.com',
    password: 'password123',
    phone: '9876543210',
    membership: 'Premium',
    status: 'Active'
  },
  {
    name: 'Priya Sharma',
    email: 'priya@example.com',
    password: 'password123',
    phone: '9876543211',
    membership: 'Pro',
    status: 'Active'
  },
  {
    name: 'Rohan Patel',
    email: 'rohan@example.com',
    password: 'password123',
    phone: '9876543212',
    membership: 'Basic',
    status: 'Active'
  },
  {
    name: 'Ananya Singh',
    email: 'ananya@example.com',
    password: 'password123',
    phone: '9876543213',
    membership: 'None',
    status: 'Active'
  },
  {
    name: 'Vikram Reddy',
    email: 'vikram@example.com',
    password: 'password123',
    phone: '9876543214',
    membership: 'Premium',
    status: 'Active'
  }
];

async function seedUsers() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB connected successfully!');
    console.log('📊 Database:', mongoose.connection.name);
    
    // Check existing users
    const existingCount = await User.countDocuments();
    console.log(`\n📈 Current users in database: ${existingCount}`);
    
    console.log('\n📝 Adding sample users...\n');
    
    let addedCount = 0;
    let skippedCount = 0;
    
    for (const userData of sampleUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      
      if (existingUser) {
        console.log(`⚠️  Skipped: ${userData.name} (${userData.email}) - already exists`);
        skippedCount++;
        continue;
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create user
      const user = new User({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        phone: userData.phone,
        membership: userData.membership,
        status: userData.status,
        role: 'user'
      });
      
      await user.save();
      console.log(`✅ Added: ${userData.name} (${userData.email}) - ${userData.membership}`);
      addedCount++;
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`📊 Summary:`);
    console.log(`   ✅ Users added: ${addedCount}`);
    console.log(`   ⚠️  Users skipped: ${skippedCount}`);
    console.log(`   📈 Total users now: ${await User.countDocuments()}`);
    console.log('='.repeat(60));
    
    console.log('\n💡 Default password for all sample users: password123');
    console.log('\n✅ Seeding completed successfully!');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

// Run the seeding
seedUsers();
