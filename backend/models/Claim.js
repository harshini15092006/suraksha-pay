const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  policyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Policy', required: true },
  triggerType: { type: String, enum: ['rainfall', 'temperature', 'aqi', 'manual_simulation'], required: true },
  triggerValue: { type: Number, required: true },
  triggerThreshold: { type: Number, required: true },
  hoursLost: { type: Number, required: true },
  hourlyIncome: { type: Number, required: true },
  payoutAmount: { type: Number, required: true },
  status: { type: String, enum: ['approved', 'flagged', 'rejected'], default: 'approved' },
  autoTriggered: { type: Boolean, default: true },
  city: { type: String, required: true },
  weatherData: { type: Object },
  isFraud: { type: Boolean, default: false },
  fraudReasons: [{ type: String }],
  paymentSimulated: { type: Boolean, default: true },
  claimedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Claim', claimSchema);
