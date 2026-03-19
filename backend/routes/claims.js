const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { simulateClaim, getMyClaims } = require('../controllers/claimsController');

router.post('/simulate', protect, simulateClaim);
router.get('/my', protect, getMyClaims);

module.exports = router;
