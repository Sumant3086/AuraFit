const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Test MongoDB connection and add sample data
async function testDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB connected successfully!');
    console.log('📊 Database:', mongoose.connection.name);
    console.log('🌐 Host:', mongoose.connection.host);
    
    // Import models
    const User = require('./models/User');
    const Membership = require('./models/Membership');
    const Order = require('./models/Order');
    
    // Check existing data
    const userCount = await User.countDocuments();
    const membershipCount = await Membership.countDocuments();
    const orderCount = await Order.countDocuments();
    
    console.log('\n📈 Current Database Stats:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Memberships: ${membershipCount}`);
    console.log(`   Orders: ${orderCount}`);
    
    // Add sample membership if none exist
    if (membershipCount === 0) {
      console.log('\n📝 Adding sample membership...');
      const sampleMembership = new Membership({
        name: 'Test User',
        email: 'test@example.com',
        phone: '9876543210',
        plan: 'basic',
        duration: '1-month',
        price: 999,
        status: 'pending',
        paymentStatus: 'pending'
      });
      
      await sampleMembership.save();
      console.log('✅ Sample membership created!');
    }
    
    // List all memberships
    const memberships = await Membership.find().limit(5);
    console.log('\n📋 Recent Memberships:');
    memberships.forEach(m => {
      console.log(`   - ${m.name} (${m.email}) - ${m.plan} - ${m.status}`);
    });
    
    console.log('\n✅ Database test completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Database test failed:', error.message);
    process.exit(1);
  }
}

testDatabase();
