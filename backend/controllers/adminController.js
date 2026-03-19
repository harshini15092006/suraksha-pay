const User = require('../models/User');
const Policy = require('../models/Policy');
const Claim = require('../models/Claim');
const FraudLog = require('../models/FraudLog');

// @GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const [totalUsers, activePolicies, totalClaims, fraudAlerts, recentClaims, fraudLogs] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Policy.countDocuments({ status: 'active' }),
      Claim.countDocuments(),
      FraudLog.countDocuments({ resolved: false }),
      Claim.find().sort({ claimedAt: -1 }).limit(10).populate('userId', 'name city platform'),
      FraudLog.find({ resolved: false }).sort({ detectedAt: -1 }).limit(10).populate('userId', 'name city')
    ]);

    const totalPayouts = await Claim.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$payoutAmount' } } }
    ]);

    // High-risk zones
    const highRiskZones = await Claim.aggregate([
      { $group: { _id: '$city', claimCount: { $sum: 1 }, totalPayout: { $sum: '$payoutAmount' } } },
      { $sort: { claimCount: -1 } },
      { $limit: 5 }
    ]);

    // Claims by trigger type
    const claimsByTrigger = await Claim.aggregate([
      { $group: { _id: '$triggerType', count: { $sum: 1 } } }
    ]);

    // Weekly claim trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const claimTrend = await Claim.aggregate([
      { $match: { claimedAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$claimedAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        activePolicies,
        totalClaims,
        fraudAlerts,
        totalPayouts: totalPayouts[0]?.total || 0,
        highRiskZones,
        claimsByTrigger,
        claimTrend,
        recentClaims,
        fraudLogs
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
};

// @GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};

// @POST /api/admin/resolve-fraud/:id
const resolveFraud = async (req, res) => {
  try {
    await FraudLog.findByIdAndUpdate(req.params.id, { resolved: true });
    res.json({ success: true, message: 'Fraud alert resolved' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to resolve fraud' });
  }
};

module.exports = { getStats, getUsers, resolveFraud };
