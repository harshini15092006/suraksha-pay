const axios = require('axios');
const Policy = require('../models/Policy');
const User = require('../models/User');

// AI Risk scoring (mirrors Python AI service logic as fallback)
const calculateRiskScore = (city, weatherData) => {
  // City base risk (monsoon + heat patterns)
  const cityRisk = {
    'Mumbai': 0.75, 'Chennai': 0.70, 'Kolkata': 0.65,
    'Hyderabad': 0.55, 'Vijayawada': 0.60, 'Pune': 0.50,
    'Delhi': 0.60, 'Bangalore': 0.45, 'Ahmedabad': 0.55,
    'Jaipur': 0.45, 'Surat': 0.65, 'Lucknow': 0.50
  };

  const base = cityRisk[city] || 0.50;
  const rainFactor = weatherData?.rainfall > 5 ? 0.20 : weatherData?.rainfall > 2 ? 0.10 : 0;
  const heatFactor = weatherData?.temperature > 38 ? 0.15 : weatherData?.temperature > 35 ? 0.08 : 0;
  const aqiFactor = weatherData?.aqi > 200 ? 0.15 : weatherData?.aqi > 150 ? 0.08 : 0;

  return Math.min(1.0, parseFloat((base + rainFactor + heatFactor + aqiFactor).toFixed(2)));
};

const calculatePremium = (riskScore, weatherData) => {
  const BASE_PREMIUM = 20;
  const rainRisk = weatherData?.rainfall > 5 ? 15 : weatherData?.rainfall > 2 ? 8 : 0;
  const heatRisk = weatherData?.temperature > 38 ? 10 : weatherData?.temperature > 35 ? 5 : 0;
  const aqiRisk = weatherData?.aqi > 200 ? 10 : weatherData?.aqi > 150 ? 5 : 0;
  const riskMultiplier = Math.round(riskScore * 20);

  return {
    basePremium: BASE_PREMIUM,
    rainRisk,
    heatRisk,
    aqiRisk,
    riskMultiplier,
    total: BASE_PREMIUM + rainRisk + heatRisk + aqiRisk + riskMultiplier
  };
};

// @POST /api/policies/generate
const generatePolicy = async (req, res) => {
  try {
    const user = req.user;
    let weatherData = null;

    // Try to get AI service risk score
    try {
      const aiResponse = await axios.post(`${process.env.AI_SERVICE_URL}/risk-score`, {
        city: user.city,
        avg_daily_income: user.avgDailyIncome,
        avg_daily_hours: user.avgDailyHours,
        platform: user.platform
      }, { timeout: 3000 });
      weatherData = aiResponse.data.weather_data;
    } catch {
      // Fetch weather directly as fallback
      try {
        const { CITY_COORDS } = require('./weatherController');
        const coords = CITY_COORDS[user.city];
        if (coords) {
          const resp = await axios.get(
            `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,precipitation&timezone=Asia%2FKolkata`,
            { timeout: 4000 }
          );
          weatherData = {
            temperature: resp.data.current.temperature_2m,
            rainfall: resp.data.current.precipitation,
            aqi: 100 + Math.random() * 80
          };
        }
      } catch {
        weatherData = {
          temperature: 32 + Math.random() * 8,
          rainfall: Math.random() * 8,
          aqi: 80 + Math.random() * 120
        };
      }
    }

    const riskScore = calculateRiskScore(user.city, weatherData);
    const premiumBreakdown = calculatePremium(riskScore, weatherData);
    const coverageAmount = user.avgDailyIncome * 7; // 7 days coverage

    // Deactivate old policies
    await Policy.updateMany(
      { userId: user._id, status: 'active' },
      { status: 'expired' }
    );

    // Safe working hours suggestion
    const safeHours = [];
    const temp = weatherData?.temperature || 32;
    for (let h = 6; h <= 22; h++) {
      if (temp < 36 && h !== 12 && h !== 13 && h !== 14) {
        safeHours.push(`${h}:00–${h + 1}:00`);
      }
    }

    const weatherWarnings = [];
    if (weatherData?.rainfall > 5) weatherWarnings.push('Heavy rain expected — avoid peak hours');
    if (weatherData?.temperature > 38) weatherWarnings.push('Extreme heat warning — carry water, limit afternoon work');
    if (weatherData?.aqi > 200) weatherWarnings.push('Poor air quality — use mask while working');

    const policy = await Policy.create({
      userId: user._id,
      city: user.city,
      weeklyPremium: premiumBreakdown.total,
      basePremium: premiumBreakdown.basePremium,
      rainRisk: premiumBreakdown.rainRisk,
      heatRisk: premiumBreakdown.heatRisk,
      aqiRisk: premiumBreakdown.aqiRisk,
      riskScore,
      coverageAmount,
      safeHours: safeHours.slice(0, 6),
      weatherWarnings
    });

    // Update user risk score
    await User.findByIdAndUpdate(user._id, { riskScore });

    res.json({
      success: true,
      message: `Policy generated! ₹${premiumBreakdown.total} charged (Simulated)`,
      policy,
      premiumBreakdown,
      weatherData,
      paymentSimulated: `₹${premiumBreakdown.total} debited successfully (Simulated)`
    });
  } catch (error) {
    console.error('Generate policy error:', error);
    res.status(500).json({ success: false, message: 'Policy generation failed' });
  }
};

// @GET /api/policies/active
const getActivePolicy = async (req, res) => {
  try {
    const policy = await Policy.findOne({ userId: req.user._id, status: 'active' }).sort({ createdAt: -1 });
    res.json({ success: true, policy });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch policy' });
  }
};

// @GET /api/policies/my
const getMyPolicies = async (req, res) => {
  try {
    const policies = await Policy.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, policies });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch policies' });
  }
};

module.exports = { generatePolicy, getActivePolicy, getMyPolicies, calculateRiskScore, calculatePremium };
