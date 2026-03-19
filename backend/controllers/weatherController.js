const axios = require('axios');

// City coordinates mapping for India
const CITY_COORDS = {
  'Mumbai': { lat: 19.0760, lon: 72.8777 },
  'Delhi': { lat: 28.6139, lon: 77.2090 },
  'Bangalore': { lat: 12.9716, lon: 77.5946 },
  'Hyderabad': { lat: 17.3850, lon: 78.4867 },
  'Chennai': { lat: 13.0827, lon: 80.2707 },
  'Kolkata': { lat: 22.5726, lon: 88.3639 },
  'Pune': { lat: 18.5204, lon: 73.8567 },
  'Ahmedabad': { lat: 23.0225, lon: 72.5714 },
  'Jaipur': { lat: 26.9124, lon: 75.7873 },
  'Vijayawada': { lat: 16.5062, lon: 80.6480 },
  'Surat': { lat: 21.1702, lon: 72.8311 },
  'Lucknow': { lat: 26.8467, lon: 80.9462 }
};

// Thresholds for parametric triggers
const THRESHOLDS = {
  rainfall: 10,       // mm/hour
  temperature: 40,    // °C
  aqi: 200           // AQI index (simulated)
};

// Generate mock AQI based on city & conditions
const getMockAQI = (city, temp) => {
  const baseAQI = {
    'Delhi': 180, 'Mumbai': 120, 'Kolkata': 150,
    'Chennai': 80, 'Bangalore': 90, 'Hyderabad': 100,
    'Pune': 95, 'Ahmedabad': 130, 'Jaipur': 110,
    'Vijayawada': 85, 'Surat': 115, 'Lucknow': 160
  };
  const base = baseAQI[city] || 100;
  const variation = Math.random() * 40 - 20;
  return Math.max(0, Math.round(base + variation + (temp > 38 ? 30 : 0)));
};

// @GET /api/weather/:city
const getWeather = async (req, res) => {
  try {
    const { city } = req.params;
    const coords = CITY_COORDS[city];

    if (!coords) {
      // Return mock data for unknown cities
      return res.json(generateMockWeather(city));
    }

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,precipitation,weathercode,windspeed_10m&hourly=temperature_2m,precipitation_probability&timezone=Asia%2FKolkata&forecast_days=1`;
      
      const response = await axios.get(url, { timeout: 5000 });
      const current = response.data.current;
      const hourly = response.data.hourly;

      const temp = current.temperature_2m;
      const rainfall = current.precipitation;
      const aqi = getMockAQI(city, temp);
      
      // Determine safe working hours
      const safeHours = [];
      if (hourly && hourly.time) {
        hourly.time.forEach((time, idx) => {
          const hour = new Date(time).getHours();
          const hourTemp = hourly.temperature_2m[idx];
          const rainProb = hourly.precipitation_probability[idx];
          if (hourTemp < 36 && rainProb < 30 && hour >= 6 && hour <= 22) {
            safeHours.push(`${hour}:00`);
          }
        });
      }

      const weatherData = {
        city,
        temperature: temp,
        rainfall,
        aqi,
        windspeed: current.windspeed_10m,
        weathercode: current.weathercode,
        thresholds: THRESHOLDS,
        triggers: {
          rainfall: rainfall > THRESHOLDS.rainfall,
          temperature: temp > THRESHOLDS.temperature,
          aqi: aqi > THRESHOLDS.aqi
        },
        safeHours: safeHours.slice(0, 6),
        source: 'open-meteo',
        timestamp: new Date()
      };

      res.json({ success: true, data: weatherData });
    } catch (apiError) {
      // Fallback to mock
      console.log('Open-Meteo unavailable, using mock data');
      res.json(generateMockWeather(city));
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Weather fetch error' });
  }
};

const generateMockWeather = (city) => {
  const temp = 28 + Math.random() * 15;
  const rainfall = Math.random() * 5;
  const aqi = getMockAQI(city || 'Mumbai', temp);

  return {
    success: true,
    data: {
      city,
      temperature: parseFloat(temp.toFixed(1)),
      rainfall: parseFloat(rainfall.toFixed(1)),
      aqi,
      windspeed: parseFloat((5 + Math.random() * 20).toFixed(1)),
      weathercode: 0,
      thresholds: THRESHOLDS,
      triggers: {
        rainfall: rainfall > THRESHOLDS.rainfall,
        temperature: temp > THRESHOLDS.temperature,
        aqi: aqi > THRESHOLDS.aqi
      },
      safeHours: ['7:00', '8:00', '9:00', '18:00', '19:00', '20:00'],
      source: 'mock',
      timestamp: new Date()
    }
  };
};

// @POST /api/weather/simulate-rain
const simulateRain = async (req, res) => {
  const { city } = req.body;
  const temp = 29 + Math.random() * 5;
  const aqi = getMockAQI(city, temp);

  res.json({
    success: true,
    data: {
      city,
      temperature: parseFloat(temp.toFixed(1)),
      rainfall: 45.5,  // Extreme rain
      aqi,
      windspeed: 35.2,
      weathercode: 95,
      thresholds: THRESHOLDS,
      triggers: { rainfall: true, temperature: false, aqi: aqi > THRESHOLDS.aqi },
      safeHours: [],
      source: 'simulated',
      simulated: true,
      timestamp: new Date()
    }
  });
};

module.exports = { getWeather, simulateRain, THRESHOLDS, CITY_COORDS };
