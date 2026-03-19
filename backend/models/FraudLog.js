const mongoose = require('mongoose');

const fraudLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  claimId: { type: mongoose.Schema.Types.ObjectId, ref: 'Claim' },
  fraudType: {
    type: String,
    enum: ['duplicate_claim', 'gps_mismatch', 'unrealistic_income', 'unrealistic_hours', 'multiple_triggers'],
    required: true
  },
  description: { type: String, required: true },
  severity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  resolved: { type: Boolean, default: false },
  detectedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('FraudLog', fraudLogSchema);
