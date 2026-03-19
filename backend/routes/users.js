const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
});

router.put('/profile', protect, async (req, res) => {
  try {
    const { avgDailyIncome, avgDailyHours, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avgDailyIncome, avgDailyHours, phone },
      { new: true }
    );
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Update failed' });
  }
});

module.exports = router;
