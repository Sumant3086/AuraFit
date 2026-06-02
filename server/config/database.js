const mongoose = require('mongoose');
const { logger } = require('../middleware/logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 2,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
      family: 4,
    });

    logger.info(`MongoDB connected: ${conn.connection.host} / ${conn.connection.name}`);
    await createIndexes();
    return conn;
  } catch (err) {
    logger.error(`MongoDB connection failed: ${err.message}`);
    process.exit(1);
  }
};

const createIndexes = async () => {
  try {
    const models = [
      'User', 'Membership', 'Order', 'Product',
      'Class', 'WorkoutPlan', 'NutritionPlan', 'ProgressTracker',
    ];

    // Only create if models exist (lazy require to avoid circular deps)
    const indexDefs = {
      User: [
        [{ email: 1 }, { unique: true }],
        [{ createdAt: -1 }],
        [{ membership: 1 }],
        [{ role: 1 }],
      ],
      Membership: [
        [{ email: 1 }],
        [{ status: 1 }],
        [{ plan: 1, status: 1 }],
        [{ createdAt: -1 }],
      ],
      Order: [
        [{ userId: 1 }],
        [{ orderDate: -1 }],
        [{ paymentStatus: 1 }],
      ],
      Product: [
        [{ name: 'text', description: 'text' }],
        [{ category: 1 }],
        [{ price: 1 }],
      ],
      Class: [
        [{ name: 'text', description: 'text' }],
        [{ 'schedule.day': 1 }],
        [{ isActive: 1 }],
      ],
      WorkoutPlan: [[{ userId: 1 }], [{ createdAt: -1 }]],
      NutritionPlan: [[{ userId: 1 }], [{ createdAt: -1 }]],
      ProgressTracker: [[{ userId: 1, date: -1 }]],
    };

    for (const [modelName, indexes] of Object.entries(indexDefs)) {
      try {
        const Model = require(`../models/${modelName}`);
        for (const [fields, options = {}] of indexes) {
          await Model.collection.createIndex(fields, { background: true, ...options }).catch(() => {});
        }
      } catch {}
    }

    logger.info('Database indexes verified');
  } catch (err) {
    logger.warn(`Index creation warning: ${err.message}`);
  }
};

// Slow query monitor — only in development
if (process.env.NODE_ENV !== 'production') {
  mongoose.plugin((schema) => {
    schema.pre('find', function () { this._t = Date.now(); });
    schema.post('find', function () {
      if (this._t && Date.now() - this._t > 150) {
        logger.warn(`Slow query: ${Date.now() - this._t}ms`);
      }
    });
  });
}

module.exports = { connectDB };
