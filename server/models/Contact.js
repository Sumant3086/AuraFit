const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['new', 'open', 'in_progress', 'resolved', 'closed', 'read', 'responded'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['general', 'billing', 'membership', 'technical', 'trainer', 'complaint', 'feedback'],
    default: 'general'
  },
  assignedTo: { type: String, default: '' },
  adminNotes: { type: String, default: '' },
  response: { type: String, default: '' },
  respondedAt: { type: Date },
  resolvedAt: { type: Date },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Contact', contactSchema);
