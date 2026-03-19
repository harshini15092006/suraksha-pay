const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getWeather, simulateRain } = require('../controllers/weatherController');

router.get('/:city', protect, getWeather);
router.post('/simulate-rain', protect, simulateRain);

module.exports = router;
