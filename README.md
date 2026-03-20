# 🛡️ SurakshaPay — AI-Powered Parametric Insurance for Gig Delivery Workers

<div align="center">

![Insurance](https://img.shields.io/badge/Type-Parametric%20Insurance-orange?style=for-the-badge)
![AI](https://img.shields.io/badge/Powered%20By-AI%20%2F%20ML-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Hackathon%20Project-green?style=for-the-badge)
![Node](https://img.shields.io/badge/Backend-Node.js-green?style=for-the-badge)
![React](https://img.shields.io/badge/Frontend-React.js-61DAFB?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge)

**Automatic income protection for gig delivery workers — no forms, no waiting, no hassle.**

🌐 **Live Demo:** [suraksha-pay.netlify.app](https://suraksha-pay.netlify.app)
🔧 **Backend API:** [suraksha-pay-backend.onrender.com](https://suraksha-pay-backend.onrender.com/api/health)

</div>

---

## 📌 Problem Statement

Swiggy, Zomato & Blinkit delivery partners lose income every time external conditions make work impossible:

- 🌧️ **Heavy Rain** — roads flood, orders stop, no income
- 🌡️ **Extreme Heat** — dangerous temperatures force workers indoors
- 💨 **Toxic Air (AQI)** — pollution makes outdoor work hazardous
- 🚫 **Government Curfews** — sudden lockdowns with zero notice

> **15 crore gig workers in India have zero income protection. This happens 80–100 days every year.**

---

## 💡 Our Solution

**SurakshaPay** — An AI-powered parametric insurance platform that:

- ✅ Automatically monitors real-time weather, AQI, and alerts
- ✅ Triggers instant payouts when conditions cross thresholds
- ✅ Requires **zero manual claims** from the worker
- ✅ Uses AI to price premiums fairly based on actual risk
- ✅ Detects and prevents fraudulent claims automatically
- ✅ Suggests safe working hours to maximise daily earnings

---

## 🎯 Target Users

| User | Profile |
|------|---------|
| Primary | Zomato, Swiggy, Blinkit delivery partners |
| Cities | Mumbai, Delhi, Bangalore, Hyderabad, Chennai, Kolkata + 6 more |
| Income | ₹500–₹1,000/day average |
| Pain Point | 80–100 income-lost days per year due to weather |

---

## 💰 Weekly Premium Model

Workers pay a small weekly premium based on AI risk scoring:

| Risk Level | Cities | Weekly Premium |
|-----------|--------|---------------|
| 🟢 Low Risk | Bangalore, Pune, Jaipur | ₹20–₹35 / week |
| 🟡 Medium Risk | Hyderabad, Chennai, Ahmedabad | ₹35–₹55 / week |
| 🔴 High Risk | Mumbai, Delhi, Kolkata | ₹55–₹90 / week |


> **Less than the cost of a single meal delivery — for a full week of income protection.**

---

## ⚡ Parametric Triggers

Payouts fire **automatically** the moment any condition is breached:

| Trigger | Threshold | Hours Covered | Auto Payout |
|---------|-----------|--------------|-------------|
| 🌧️ Rainfall | > 10 mm/hr | 4 hours | Instant |
| 🌡️ Temperature | > 40°C | 3 hours | Instant |
| 💨 AQI Index | > 200 | 2 hours | Instant |

### Payout Formula
```
Payout = Hours Lost × Hourly Income
Example: 4 hrs × ₹81/hr = ₹325 auto-credited
```

**No claim form. No phone call. No approval needed.**

---

## 🤖 AI Integration

### 1. Risk Zone Prediction
- Analyses live weather data from Open-Meteo API
- City-specific risk profiles for 12 Indian cities
- Monsoon season awareness built into scoring
- Numpy weighted feature vector model

### 2. Dynamic Premium Pricing
```
Features:  [city_risk, monsoon_season, rainfall, heat, aqi, income]
Weights:   [  0.35,       0.15,         0.20,   0.15, 0.10,  0.05]
Score:     dot(features, weights) → 0.0 to 1.0
```

### 3. Safe Working Hours Suggestion
- Analyses hourly weather forecasts
- Suggests best hours to maximise earnings
- Warns about dangerous conditions

### 4. Fraud Detection (4 Automated Checks)
- 🔍 Duplicate claim detection (same trigger, same day)
- 📍 GPS location mismatch simulation
- ⏱️ Unrealistic hours validation (> 12h flagged)
- 📊 Multiple claims per policy period detection

---

## 🔄 Application Workflow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Register  │────▶│  AI Prices   │────▶│  Pay Premium    │
│  on Platform│     │  Your Risk   │     │  ₹20–₹90/week   │
└─────────────┘     └──────────────┘     └────────┬────────┘
                                                   │
                                                   ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Payout    │◀────│Auto Trigger  │◀────│ System Monitors │
│  Credited   │     │  Fires       │     │ Weather + AQI   │
│  Instantly  │     │  < 5 min     │     │   24/7          │
└─────────────┘     └──────────────┘     └─────────────────┘
```

### Step-by-Step:
1. 📝 Worker **registers** — name, city, platform, daily income
2. 🤖 **AI calculates** risk score and weekly premium instantly
3. 💳 Worker **pays premium** (₹20–₹90/week — simulated)
4. 📡 System **monitors** real-time weather and AQI 24/7
5. ⚡ If disruption detected → **automatic claim triggered**
6. ✅ **Payout credited instantly** — no action needed from worker

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| 🖥️ Frontend | React.js + Vite + Tailwind CSS |
| ⚙️ Backend | Node.js + Express.js |
| 🗄️ Database | MongoDB Atlas (free tier) |
| 🌦️ Weather API | Open-Meteo API (free, no key needed) |
| 🤖 AI / ML | Python FastAPI + NumPy |
| 📊 Charts | Recharts |
| 🔐 Auth | JWT (JSON Web Tokens) |
| ⏰ Scheduler | node-cron (parametric triggers) |
| 🚀 Frontend Host | Netlify |
| 🔧 Backend Host | Render.com |

> **100% Free Stack — Zero paid services used**

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- Python 3.9+
- MongoDB Atlas account (free)

### Installation & Running

```bash
# Clone the repository
git clone https://github.com/harshini15092006/suraksha-pay.git
cd suraksha-pay

# Terminal 1 — Backend
cd backend
npm install
npm run dev

# Terminal 2 — Seed demo data (run once)
cd backend
node seed.js

# Terminal 3 — Frontend
cd frontend
npm install
npm run dev

# Terminal 4 — AI Service (optional)
cd ai-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 🌐 Live Demo

| Service | URL |
|---------|-----|
| 🌐 Frontend | https://suraksha-pay.netlify.app |
| 🔧 Backend API | https://suraksha-pay-backend.onrender.com/api/health |

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| 👷 Worker | raju@demo.com | Demo@123 |
| 👷 Worker | priya@demo.com | Demo@123 |
| 🛡️ Admin | admin@surakshapay.in | Admin@123 |

---

## 📊 Key Features

### Worker Dashboard
- 📋 Active policy with premium breakdown
- 💸 Total earnings protected
- 🌤️ Live weather widget for city
- 🕐 AI-suggested safe working hours
- 📈 Payout history chart (last 7 days)
- 🌧️ **Simulate Rain button** — instant demo payout

### Policy Page
- 🤖 One-click AI policy generation
- 📊 Premium breakdown (base + risks)
- 🎯 Risk score visualization
- ⚠️ Weather warnings for the week

### Claims Page
- 📋 Full claim history with filters
- 📊 Bar chart — payouts over time
- 🥧 Pie chart — claims by trigger type
- 🚨 Fraud flag indicators

### Admin Dashboard
- 👥 Total users + active policies
- ⚡ Claims triggered + total payouts
- 🗺️ High-risk zones ranking
- 🚨 Fraud alerts with resolve button
- 📈 7-day claims trend chart

---

## 🔮 Future Scope

| Feature | Description |
|---------|-------------|
| 📱 Mobile App | Native Android/iOS application |
| 🔗 Platform Integration | Direct API with Zomato/Swiggy |
| 📍 GPS Tracking | Real-time location verification |
| 🧠 Advanced AI | Deep learning for better risk prediction |
| 🌍 Pan-India Scale | Expand to 50+ cities |
| 💳 UPI Integration | Instant UPI payout to worker accounts |
| 📊 Analytics | City-wise risk heatmaps and trends |
| 🚫 Curfew Detection | Government alert API integration |

---

## 👥 Team

> Built with ❤️ for India's 15 crore gig economy workers

---

## 📄 License

This project is built for hackathon purposes.

---

<div align="center">

**"When the rain falls — the money arrives."**

⭐ Star this repo if you found it useful!

🛡️ SurakshaPay — Protecting India's Gig Workers

</div>