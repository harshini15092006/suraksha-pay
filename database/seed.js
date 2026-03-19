const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Policy = require('./models/Policy');
const Claim = require('./models/Claim');
const FraudLog = require('./models/FraudLog');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await User.deleteMany({});
  await Policy.deleteMany({});
  await Claim.deleteMany({});
  await FraudLog.deleteMany({});

  // Create admin
  const admin = await User.create({
    name: 'Admin SurakshaPay',
    email: 'admin@surakshapay.in',
    password: 'Admin@123',
    phone: '9000000000',
    city: 'Mumbai',
    platform: 'Zomato',
    avgDailyIncome: 800,
    avgDailyHours: 8,
    role: 'admin'
  });

  // Create demo users
  const users = await User.create([
    {
      name: 'Raju Kumar',
      email: 'raju@demo.com',
      password: 'Demo@123',
      phone: '9876543210',
      city: 'Mumbai',
      platform: 'Zomato',
      avgDailyIncome: 650,
      avgDailyHours: 8,
      totalEarningsProtected: 2340
    },
    {
      name: 'Priya Singh',
      email: 'priya@demo.com',
      password: 'Demo@123',
      phone: '9876543211',
      city: 'Delhi',
      platform: 'Swiggy',
      avgDailyIncome: 700,
      avgDailyHours: 9,
      totalEarningsProtected: 1890
    },
    {
      name: 'Arjun Reddy',
      email: 'arjun@demo.com',
      password: 'Demo@123',
      phone: '9876543212',
      city: 'Hyderabad',
      platform: 'Swiggy',
      avgDailyIncome: 580,
      avgDailyHours: 7,
      totalEarningsProtected: 980
    },
    {
      name: 'Meena Devi',
      email: 'meena@demo.com',
      password: 'Demo@123',
      phone: '9876543213',
      city: 'Chennai',
      platform: 'Zomato',
      avgDailyIncome: 620,
      avgDailyHours: 8,
      totalEarningsProtected: 1560
    }
  ]);

  // Create policies for demo users
  const policies = await Policy.create([
    {
      userId: users[0]._id,
      city: 'Mumbai',
      weeklyPremium: 65,
      basePremium: 20,
      rainRisk: 15,
      heatRisk: 5,
      aqiRisk: 10,
      riskScore: 0.78,
      coverageAmount: 4550,
      status: 'active',
      safeHours: ['7:00', '8:00', '9:00', '18:00', '19:00', '20:00'],
      weatherWarnings: ['Heavy rain expected — avoid peak hours']
    },
    {
      userId: users[1]._id,
      city: 'Delhi',
      weeklyPremium: 70,
      basePremium: 20,
      rainRisk: 8,
      heatRisk: 10,
      aqiRisk: 10,
      riskScore: 0.72,
      coverageAmount: 4900,
      status: 'active',
      safeHours: ['6:00', '7:00', '8:00', '17:00', '18:00', '19:00'],
      weatherWarnings: ['Poor air quality — use mask while working']
    },
    {
      userId: users[2]._id,
      city: 'Hyderabad',
      weeklyPremium: 55,
      basePremium: 20,
      rainRisk: 8,
      heatRisk: 5,
      aqiRisk: 5,
      riskScore: 0.58,
      coverageAmount: 4060,
      status: 'active',
      safeHours: ['6:00', '7:00', '8:00', '9:00', '18:00', '19:00'],
      weatherWarnings: []
    }
  ]);

  // Create sample claims
  const claimDates = [-5, -3, -1, 0].map(d => {
    const date = new Date();
    date.setDate(date.getDate() + d);
    return date;
  });

  await Claim.create([
    {
      userId: users[0]._id,
      policyId: policies[0]._id,
      triggerType: 'rainfall',
      triggerValue: 42.3,
      triggerThreshold: 10,
      hoursLost: 4,
      hourlyIncome: 81.25,
      payoutAmount: 325,
      status: 'approved',
      city: 'Mumbai',
      autoTriggered: true,
      claimedAt: claimDates[0],
      weatherData: { temperature: 28.5, rainfall: 42.3, aqi: 115 }
    },
    {
      userId: users[0]._id,
      policyId: policies[0]._id,
      triggerType: 'rainfall',
      triggerValue: 28.7,
      triggerThreshold: 10,
      hoursLost: 4,
      hourlyIncome: 81.25,
      payoutAmount: 325,
      status: 'approved',
      city: 'Mumbai',
      autoTriggered: true,
      claimedAt: claimDates[1],
      weatherData: { temperature: 27.1, rainfall: 28.7, aqi: 108 }
    },
    {
      userId: users[1]._id,
      policyId: policies[1]._id,
      triggerType: 'aqi',
      triggerValue: 310,
      triggerThreshold: 200,
      hoursLost: 2,
      hourlyIncome: 77.78,
      payoutAmount: 155.56,
      status: 'approved',
      city: 'Delhi',
      autoTriggered: true,
      claimedAt: claimDates[2],
      weatherData: { temperature: 34.5, rainfall: 0, aqi: 310 }
    },
    {
      userId: users[2]._id,
      policyId: policies[2]._id,
      triggerType: 'temperature',
      triggerValue: 43.2,
      triggerThreshold: 40,
      hoursLost: 3,
      hourlyIncome: 82.86,
      payoutAmount: 248.57,
      status: 'approved',
      city: 'Hyderabad',
      autoTriggered: true,
      claimedAt: claimDates[3],
      weatherData: { temperature: 43.2, rainfall: 0, aqi: 95 }
    },
    {
      userId: users[0]._id,
      policyId: policies[0]._id,
      triggerType: 'manual_simulation',
      triggerValue: 45.5,
      triggerThreshold: 10,
      hoursLost: 4,
      hourlyIncome: 81.25,
      payoutAmount: 325,
      status: 'flagged',
      city: 'Mumbai',
      autoTriggered: false,
      isFraud: true,
      fraudReasons: ['Duplicate claim: same trigger type claimed today'],
      claimedAt: claimDates[3],
      weatherData: { temperature: 29.5, rainfall: 45.5, aqi: 120 }
    }
  ]);

  // Create fraud logs
  await FraudLog.create([
    {
      userId: users[0]._id,
      fraudType: 'duplicate_claim',
      description: 'User attempted duplicate rainfall claim',
      severity: 'high',
      resolved: false
    },
    {
      userId: users[1]._id,
      fraudType: 'gps_mismatch',
      description: 'Claim location coordinates do not match registered city',
      severity: 'medium',
      resolved: false
    }
  ]);

  console.log('✅ Seed data created successfully!');
  console.log('\n📧 Demo Accounts:');
  console.log('Admin: admin@surakshapay.in / Admin@123');
  console.log('User 1: raju@demo.com / Demo@123');
  console.log('User 2: priya@demo.com / Demo@123');
  
  mongoose.disconnect();
};

seed().catch(console.error);
