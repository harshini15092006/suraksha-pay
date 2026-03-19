const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/policies', require('./routes/policies'));
app.use('/api/claims', require('./routes/claims'));
app.use('/api/weather', require('./routes/weather'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'SurakshaPay API running', timestamp: new Date() });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    
    // Start parametric trigger scheduler (checks every 5 minutes)
    const { checkParametricTriggers } = require('./controllers/claimsController');
    cron.schedule('*/5 * * * *', () => {
      console.log('🔍 Running parametric trigger check...');
      checkParametricTriggers();
    });

    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

module.exports = app;
