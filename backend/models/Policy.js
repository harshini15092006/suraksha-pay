const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  city: { type: String, required: true },
  weeklyPremium: { type: Number, required: true },
  basePremium: { type: Number, default: 20 },
  rainRisk: { type: Number, default: 0 },
  heatRisk: { type: Number, default: 0 },
  aqiRisk: { type: Number, default: 0 },
  riskScore: { type: Number, required: true },
  coverageAmount: { type: Number, required: true },
  status: { type: String, enum: ['active', 'expired', 'pending'], default: 'active' },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  paymentStatus: { type: String, enum: ['paid', 'pending'], default: 'paid' },
  paymentSimulated: { type: Boolean, default: true },
  safeHours: [{ type: String }],
  weatherWarnings: [{ type: String }]
}, { timestamps: true });

// Auto-set endDate to 7 days from start
policySchema.pre('save', function(next) {
  if (!this.endDate) {
    this.endDate = new Date(this.startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
  }
  next();
});

module.exports = mongoose.model('Policy', policySchema);
