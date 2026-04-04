const mongoose = require('mongoose');

// Database connection with optimizations
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Connection pooling
      minPoolSize: 5,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
      family: 4, // Use IPv4
    });

    console.log('✅ MongoDB connected successfully');
    console.log('📊 Database:', conn.connection.name);
    console.log('🔗 Connection pool size: 10');

    // Create indexes for all models
    await createIndexes();
    
    // Monitor query performance
    if (process.env.NODE_ENV === 'development') {
      mongoose.set('debug', true);
    }

    return conn;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};

// Create indexes for better query performance
const createIndexes = async () => {
  try {
    const User = require('../models/User');
    const Membership = require('../models/Membership');
    const Order = require('../models/Order');
    const Product = require('../models/Product');
    const Class = require('../models/Class');
    const WorkoutPlan = require('../models/WorkoutPlan');
    const NutritionPlan = require('../models/NutritionPlan');
    const ProgressTracker = require('../models/ProgressTracker');

    // User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ createdAt: -1 });
    await User.collection.createIndex({ membership: 1 });

    // Membership indexes
    await Membership.collection.createIndex({ userId: 1 });
    await Membership.collection.createIndex({ email: 1 });
    await Membership.collection.createIndex({ status: 1 });
    await Membership.collection.createIndex({ createdAt: -1 });
    await Membership.collection.createIndex({ plan: 1, status: 1 });

    // Order indexes
    await Order.collection.createIndex({ userId: 1 });
    await Order.collection.createIndex({ orderDate: -1 });
    await Order.collection.createIndex({ status: 1 });
    await Order.collection.createIndex({ paymentStatus: 1 });

    // Product indexes
    await Product.collection.createIndex({ name: 'text', description: 'text' });
    await Product.collection.createIndex({ category: 1 });
    await Product.collection.createIndex({ price: 1 });
    await Product.collection.createIndex({ rating: -1 });

    // Class indexes
    await Class.collection.createIndex({ name: 'text', description: 'text' });
    await Class.collection.createIndex({ 'schedule.day': 1 });
    await Class.collection.createIndex({ level: 1 });
    await Class.collection.createIndex({ isActive: 1 });

    // Workout Plan indexes
    await WorkoutPlan.collection.createIndex({ userId: 1 });
    await WorkoutPlan.collection.createIndex({ createdAt: -1 });
    await WorkoutPlan.collection.createIndex({ goal: 1 });

    // Nutrition Plan indexes
    await NutritionPlan.collection.createIndex({ userId: 1 });
    await NutritionPlan.collection.createIndex({ createdAt: -1 });
    await NutritionPlan.collection.createIndex({ goal: 1 });

    // Progress Tracker indexes
    await ProgressTracker.collection.createIndex({ userId: 1 });
    await ProgressTracker.collection.createIndex({ date: -1 });
    await ProgressTracker.collection.createIndex({ userId: 1, date: -1 });

    console.log('📇 Database indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating indexes:', error.message);
  }
};

// Query performance monitoring
mongoose.plugin((schema) => {
  schema.pre('find', function() {
    this._startTime = Date.now();
  });

  schema.post('find', function() {
    if (this._startTime) {
      const duration = Date.now() - this._startTime;
      if (duration > 100) {
        console.warn(`⚠️ Slow query detected: ${duration}ms`);
      }
    }
  });
});

module.exports = { connectDB };
