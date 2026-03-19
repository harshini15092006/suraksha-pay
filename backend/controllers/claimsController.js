const Claim = require('../models/Claim');
const Policy = require('../models/Policy');
const User = require('../models/User');
const FraudLog = require('../models/FraudLog');
const axios = require('axios');
const { THRESHOLDS, CITY_COORDS } = require('./weatherController');

// ============ FRAUD DETECTION ENGINE ============
const detectFraud = async (userId, policyId, hoursLost, triggerType) => {
  const fraudReasons = [];
  let isFraud = false;

  // 1. Duplicate claim check (same user, same day, same trigger)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const existingClaim = await Claim.findOne({
    userId,
    policyId,
    triggerType,
    claimedAt: { $gte: today, $lt: tomorrow }
  });

  if (existingClaim) {
    fraudReasons.push('Duplicate claim: same trigger type claimed today');
    isFraud = true;
    await FraudLog.create({
      userId,
      claimId: existingClaim._id,
      fraudType: 'duplicate_claim',
      description: `User attempted duplicate ${triggerType} claim on ${today.toDateString()}`,
      severity: 'high'
    });
  }

  // 2. Simulate GPS mismatch (30% random chance for demo)
  const gpsMismatch = Math.random() < 0.15;
  if (gpsMismatch) {
    fraudReasons.push('GPS mismatch: location does not match registered city');
    await FraudLog.create({
      userId,
      fraudType: 'gps_mismatch',
      description: 'Claim location coordinates do not match registered city within 50km radius',
      severity: 'medium'
    });
  }

  // 3. Unrealistic hours check
  if (hoursLost > 12) {
    fraudReasons.push(`Unrealistic hours claimed: ${hoursLost}h exceeds maximum working hours`);
    isFraud = true;
    await FraudLog.create({
      userId,
      fraudType: 'unrealistic_hours',
      description: `Claimed ${hoursLost} hours lost, which exceeds logical maximum`,
      severity: 'high'
    });
  }

  // 4. Multiple claims in policy period
  const claimCount = await Claim.countDocuments({ userId, policyId, status: 'approved' });
  if (claimCount >= 3) {
    fraudReasons.push('Excessive claims: more than 3 approved claims in policy period');
    await FraudLog.create({
      userId,
      fraudType: 'multiple_triggers',
      description: `User has ${claimCount + 1} claims in current policy period`,
      severity: 'medium'
    });
  }

  return { isFraud, fraudReasons };
};

// ============ AUTO-TRIGGER PARAMETRIC CLAIMS ============
const checkParametricTriggers = async () => {
  try {
    const activePolicies = await Policy.find({ status: 'active' }).populate('userId');

    for (const policy of activePolicies) {
      const user = policy.userId;
      if (!user) continue;

      const coords = CITY_COORDS[policy.city];
      if (!coords) continue;

      let weatherData;
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,precipitation&timezone=Asia%2FKolkata`;
        const resp = await axios.get(url, { timeout: 4000 });
        weatherData = {
          temperature: resp.data.current.temperature_2m,
          rainfall: resp.data.current.precipitation,
          aqi: 100 + Math.random() * 80
        };
      } catch {
        continue; // Skip if weather unavailable
      }

      // Check triggers
      const triggers = [
        { type: 'rainfall', value: weatherData.rainfall, threshold: THRESHOLDS.rainfall },
        { type: 'temperature', value: weatherData.temperature, threshold: THRESHOLDS.temperature },
        { type: 'aqi', value: weatherData.aqi, threshold: THRESHOLDS.aqi }
      ];

      for (const trigger of triggers) {
        if (trigger.value > trigger.threshold) {
          await createAutoClaim(user, policy, trigger.type, trigger.value, trigger.threshold, weatherData);
        }
      }
    }
  } catch (error) {
    console.error('Parametric trigger check error:', error);
  }
};

const createAutoClaim = async (user, policy, triggerType, triggerValue, threshold, weatherData) => {
  try {
    // Check if already claimed today for this trigger
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existing = await Claim.findOne({
      userId: user._id,
      policyId: policy._id,
      triggerType,
      claimedAt: { $gte: today }
    });
    if (existing) return;

    const hoursLost = triggerType === 'rainfall' ? 4 : triggerType === 'temperature' ? 3 : 2;
    const hourlyIncome = user.avgDailyIncome / user.avgDailyHours;
    const payoutAmount = parseFloat((hoursLost * hourlyIncome).toFixed(2));

    const { isFraud, fraudReasons } = await detectFraud(user._id, policy._id, hoursLost, triggerType);

    const claim = await Claim.create({
      userId: user._id,
      policyId: policy._id,
      triggerType,
      triggerValue,
      triggerThreshold: threshold,
      hoursLost,
      hourlyIncome: parseFloat(hourlyIncome.toFixed(2)),
      payoutAmount,
      city: policy.city,
      weatherData,
      isFraud,
      fraudReasons,
      status: isFraud ? 'flagged' : 'approved',
      autoTriggered: true
    });

    if (!isFraud) {
      await User.findByIdAndUpdate(user._id, {
        $inc: { totalEarningsProtected: payoutAmount }
      });
    }

    console.log(`✅ Auto-claim created for ${user.name}: ₹${payoutAmount} (${triggerType})`);
    return claim;
  } catch (error) {
    console.error('Auto claim creation error:', error);
  }
};

// @POST /api/claims/simulate
const simulateClaim = async (req, res) => {
  try {
    const { triggerType = 'rainfall' } = req.body;
    const user = req.user;

    const policy = await Policy.findOne({ userId: user._id, status: 'active' });
    if (!policy) {
      return res.status(404).json({ success: false, message: 'No active policy found. Please purchase a policy first.' });
    }

    const triggerValues = { rainfall: 45.5, temperature: 44.0, aqi: 320 };
    const triggerValue = triggerValues[triggerType] || 45.5;
    const threshold = THRESHOLDS[triggerType] || 10;

    const hoursLost = triggerType === 'rainfall' ? 4 : triggerType === 'temperature' ? 3 : 2;
    const hourlyIncome = user.avgDailyIncome / user.avgDailyHours;
    const payoutAmount = parseFloat((hoursLost * hourlyIncome).toFixed(2));

    const { isFraud, fraudReasons } = await detectFraud(user._id, policy._id, hoursLost, triggerType);

    const claim = await Claim.create({
      userId: user._id,
      policyId: policy._id,
      triggerType: 'manual_simulation',
      triggerValue,
      triggerThreshold: threshold,
      hoursLost,
      hourlyIncome: parseFloat(hourlyIncome.toFixed(2)),
      payoutAmount,
      city: policy.city,
      weatherData: { temperature: 29.5, rainfall: 45.5, aqi: 120 },
      isFraud,
      fraudReasons,
      status: isFraud ? 'flagged' : 'approved',
      autoTriggered: false
    });

    if (!isFraud) {
      await User.findByIdAndUpdate(user._id, {
        $inc: { totalEarningsProtected: payoutAmount }
      });
    }

    res.json({
      success: true,
      message: isFraud ? 'Claim flagged for review' : `₹${payoutAmount} credited successfully (Simulated)`,
      claim,
      payoutAmount,
      isFraud,
      paymentMessage: isFraud
        ? '⚠️ Claim under review'
        : `✅ ₹${payoutAmount} credited to your account (Simulated)`
    });
  } catch (error) {
    console.error('Simulate claim error:', error);
    res.status(500).json({ success: false, message: 'Claim simulation failed' });
  }
};

// @GET /api/claims/my
const getMyClaims = async (req, res) => {
  try {
    const claims = await Claim.find({ userId: req.user._id }).sort({ claimedAt: -1 }).limit(20);
    res.json({ success: true, claims });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch claims' });
  }
};

module.exports = { simulateClaim, getMyClaims, checkParametricTriggers, createAutoClaim };
