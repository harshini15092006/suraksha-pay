const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { getStats, getUsers, resolveFraud } = require('../controllers/adminController');

router.get('/stats', protect, adminOnly, getStats);
router.get('/users', protect, adminOnly, getUsers);
router.post('/resolve-fraud/:id', protect, adminOnly, resolveFraud);

module.exports = router;
