// ============================================================
// SurakshaPay — MongoDB Schema Reference
// ============================================================

// ----- users -----
{
  _id: ObjectId,
  name: String,               // "Raju Kumar"
  email: String,              // unique, lowercase
  password: String,           // bcrypt hashed
  phone: String,
  city: String,               // "Mumbai"
  platform: String,           // "Zomato" | "Swiggy" | "Blinkit" | "Zepto" | "Other"
  avgDailyIncome: Number,     // ₹650
  avgDailyHours: Number,      // 8
  role: String,               // "user" | "admin"
  isActive: Boolean,
  riskScore: Number,          // 0.0–1.0 (AI-computed)
  totalEarningsProtected: Number,
  createdAt: Date,
  updatedAt: Date
}

// ----- policies -----
{
  _id: ObjectId,
  userId: ObjectId,           // ref: users
  city: String,
  weeklyPremium: Number,      // ₹65
  basePremium: Number,        // ₹20 (constant)
  rainRisk: Number,           // 0 | 8 | 15
  heatRisk: Number,           // 0 | 5 | 10
  aqiRisk: Number,            // 0 | 5 | 10
  riskScore: Number,          // 0.0–1.0
  coverageAmount: Number,     // avgDailyIncome × 7
  status: String,             // "active" | "expired" | "pending"
  startDate: Date,
  endDate: Date,              // startDate + 7 days
  paymentStatus: String,      // "paid" | "pending"
  paymentSimulated: Boolean,  // always true (demo)
  safeHours: [String],        // ["7:00", "8:00", ...]
  weatherWarnings: [String],
  createdAt: Date,
  updatedAt: Date
}

// ----- claims -----
{
  _id: ObjectId,
  userId: ObjectId,           // ref: users
  policyId: ObjectId,         // ref: policies
  triggerType: String,        // "rainfall" | "temperature" | "aqi" | "manual_simulation"
  triggerValue: Number,       // actual reading (e.g. 42.3 mm)
  triggerThreshold: Number,   // threshold that was breached
  hoursLost: Number,          // 4 (rain) | 3 (heat) | 2 (aqi)
  hourlyIncome: Number,       // avgDailyIncome / avgDailyHours
  payoutAmount: Number,       // hoursLost × hourlyIncome
  status: String,             // "approved" | "flagged" | "rejected"
  autoTriggered: Boolean,
  city: String,
  weatherData: Object,        // snapshot at trigger time
  isFraud: Boolean,
  fraudReasons: [String],
  paymentSimulated: Boolean,
  claimedAt: Date,
  createdAt: Date,
  updatedAt: Date
}

// ----- fraud_logs -----
{
  _id: ObjectId,
  userId: ObjectId,           // ref: users
  claimId: ObjectId,          // ref: claims (optional)
  fraudType: String,          // "duplicate_claim" | "gps_mismatch" | "unrealistic_income"
                              // | "unrealistic_hours" | "multiple_triggers"
  description: String,
  severity: String,           // "low" | "medium" | "high"
  resolved: Boolean,
  detectedAt: Date,
  createdAt: Date,
  updatedAt: Date
}

// ============================================================
// Indexes (add these for production performance)
// ============================================================

// users
db.users.createIndex({ email: 1 }, { unique: true });

// policies
db.policies.createIndex({ userId: 1, status: 1 });
db.policies.createIndex({ endDate: 1 });

// claims
db.claims.createIndex({ userId: 1, policyId: 1 });
db.claims.createIndex({ claimedAt: -1 });
db.claims.createIndex({ status: 1 });

// fraud_logs
db.fraud_logs.createIndex({ userId: 1 });
db.fraud_logs.createIndex({ resolved: 1 });
