# 🛡️ AI-Powered Parametric Insurance for Swiggy Delivery Partners

<div align="center">

![Insurance](https://img.shields.io/badge/Type-Parametric%20Insurance-orange?style=for-the-badge)
![AI](https://img.shields.io/badge/Powered%20By-AI%20%2F%20ML-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Hackathon%20Project-green?style=for-the-badge)

**Automatic income protection for gig delivery workers — no forms, no waiting, no hassle.**

</div>

---

## 📌 Problem Statement

Swiggy delivery partners lose income every time external conditions make work impossible:

- 🌧️ **Heavy Rain** — roads flood, orders stop
- 🌡️ **Extreme Heat** — dangerous temperatures force workers indoors
- 💨 **Toxic Air (AQI)** — pollution makes outdoor work hazardous
- 🚫 **Government Curfews** — sudden lockdowns with zero notice

> **There is currently no system in India that protects gig workers from income loss due to these external disruptions.**

---

## 💡 Our Solution

An **AI-powered parametric insurance platform** that:

- ✅ Automatically monitors real-time weather, AQI, and alerts
- ✅ Triggers instant payouts when conditions cross thresholds
- ✅ Requires **zero manual claims** from the worker
- ✅ Uses AI to price premiums fairly based on actual risk
- ✅ Detects and prevents fraudulent claims automatically

---

## 🎯 Target Users

| User | Profile |
|------|---------|
| Primary | Swiggy delivery partners in urban areas |
| Cities | Mumbai, Delhi, Bangalore, Hyderabad, Chennai, Kolkata |
| Income | ₹500–₹1,000/day average |
| Pain Point | 80–100 income-lost days per year due to weather |

---

## 💰 Weekly Premium Model

Workers pay a small weekly premium based on their city's risk level:

| Risk Level | Cities | Weekly Premium |
|-----------|--------|---------------|
| 🟢 Low Risk | Bangalore, Pune | ₹20 / week |
| 🟡 Medium Risk | Hyderabad, Chennai, Ahmedabad | ₹30 / week |
| 🔴 High Risk | Mumbai, Delhi, Kolkata | ₹50 / week |

> **Less than the cost of a single meal delivery — for a full week of income protection.**

---

## ⚡ Parametric Triggers

Payouts fire **automatically** the moment any condition is breached:

| Trigger | Threshold | Auto Payout |
|---------|-----------|-------------|
| 🌧️ Rainfall | > 50 mm | Instant |
| 🌡️ Temperature | > 42°C | Instant |
| 💨 AQI Index | > 300 | Instant |
| 🚫 Government Curfew | Announced | Instant |

**No claim form. No phone call. No approval needed.**

---

## 🤖 AI Integration

### 1. Risk Zone Prediction
- Analyses historical weather data for each city
- Identifies high-risk zones and seasons
- Adjusts premium pricing dynamically per worker location

### 2. Dynamic Premium Pricing
- Real-time weather feeds inform weekly price
- Monsoon season = higher premium automatically
- Fair pricing — workers in safer zones pay less

### 3. Fraud Detection (Anomaly Detection)
- Flags duplicate claims on the same day
- Detects GPS location mismatches
- Identifies unrealistic income or hours claimed
- Blocks suspicious patterns before payout

---

## 🔄 Application Workflow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Register  │────▶│ Select Plan  │────▶│  Pay Premium    │
│  on Platform│     │ (Risk-Based) │     │  ₹20–₹50/week   │
└─────────────┘     └──────────────┘     └────────┬────────┘
                                                   │
                                                   ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Payout    │◀────│Auto Trigger  │◀────│ System Monitors │
│  Credited   │     │  Fires       │     │ Weather + AQI   │
│  Instantly  │     │              │     │   24/7          │
└─────────────┘     └──────────────┘     └─────────────────┘
```

### Step-by-Step:
1. 📝 Worker **registers** on the platform
2. 🗂️ Selects an **insurance plan** based on city risk
3. 💳 Pays **weekly premium** (₹20–₹50)
4. 📡 System **monitors** real-time weather, AQI, and alerts continuously
5. ⚡ If disruption detected → **automatic claim triggered**
6. ✅ **Payout credited instantly** — worker notified on app

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| 🖥️ Frontend | React.js |
| ⚙️ Backend | Spring Boot (Java) |
| 🗄️ Database | MySQL |
| 🌦️ Weather Data | Weather API (real-time) |
| 🤖 AI / ML | Python (anomaly detection + risk prediction) |

---

## 📁 Project Structure

```
ai-insurance-swiggy/
├── frontend/               React.js UI
│   ├── src/
│   │   ├── components/     Reusable UI components
│   │   ├── pages/          Dashboard, Register, Claims
│   │   └── utils/          API helpers
│
├── backend/                Spring Boot API
│   ├── controllers/        REST endpoints
│   ├── services/           Business logic
│   ├── models/             Database entities
│   └── repositories/       MySQL queries
│
├── ai-service/             Python ML microservice
│   ├── risk_model.py       Premium pricing model
│   ├── fraud_detection.py  Anomaly detection
│   └── weather_trigger.py  Parametric trigger logic
│
└── docs/                   Documentation
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- Java 17+
- Python 3.9+
- MySQL 8+

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/ai-insurance-swiggy.git
cd ai-insurance-swiggy

# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
./mvnw spring-boot:run

# AI Service
cd ai-service
pip install -r requirements.txt
python main.py
```

### Environment Variables

```env
# Backend
DB_URL=jdbc:mysql://localhost:3306/insurance_db
DB_USERNAME=root
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
WEATHER_API_KEY=your_weather_api_key

# AI Service
WEATHER_API_URL=https://api.open-meteo.com/v1/forecast
MODEL_PATH=models/risk_model.pkl
```

---

## 📊 Key Features

### Worker Dashboard
- 📋 Active policy details
- 💸 Weekly premium display
- 📈 Earnings protected so far
- 🕐 Claim history with timestamps

### Admin Dashboard
- 👥 Total registered workers
- ⚡ Claims triggered today
- 🚨 Fraud alerts panel
- 🗺️ High-risk zone map

### Real-Time Monitoring
- Live weather data feeds
- AQI index tracking
- Government alert integration
- Automatic trigger evaluation every 5 minutes

---

## 🔮 Future Scope

| Feature | Description |
|---------|-------------|
| 📱 Mobile App | Native Android/iOS application |
| 🔗 Swiggy Integration | Direct API integration with Swiggy platform |
| 📍 GPS Tracking | Real-time location verification |
| 🧠 Advanced AI | Deep learning for better risk prediction |
| 🌍 Pan-India Scale | Expand to 50+ cities |
| 💳 UPI Integration | Instant UPI payout to worker accounts |
| 📊 Analytics | City-wise risk heatmaps and trends |

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

</div>
