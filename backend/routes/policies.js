const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { generatePolicy, getActivePolicy, getMyPolicies } = require('../controllers/policiesController');

router.post('/generate', protect, generatePolicy);
router.get('/active', protect, getActivePolicy);
router.get('/my', protect, getMyPolicies);

module.exports = router;
