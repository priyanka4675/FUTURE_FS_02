const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: String, default: 'Admin' }
});

const leadSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, trim: true, default: '' },
  company: { type: String, trim: true, default: '' },
  source: {
    type: String,
    enum: ['Website', 'LinkedIn', 'Referral', 'Email', 'Cold Call', 'Other'],
    default: 'Website'
  },
  status: {
    type: String,
    enum: ['New', 'Contacted', 'Qualified', 'Converted', 'Lost'],
    default: 'New'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  message: { type: String, default: '' },
  notes: [noteSchema],
  tags: [{ type: String }],
  value: { type: Number, default: 0 },
  nextFollowUp: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);
