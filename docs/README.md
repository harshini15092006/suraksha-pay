# 🛡 SurakshaPay — AI-Powered Parametric Insurance for Gig Delivery Workers

> **Hackathon Project** — Income protection for Zomato/Swiggy delivery partners using real-time weather triggers, AI risk scoring, and automated payouts.

---

## 🎯 What It Does

SurakshaPay provides **weekly parametric income insurance** for gig delivery workers across India.
When extreme weather (rain, heat, bad air) prevents them from working, the system **automatically detects the trigger and credits their payout** — no claim form, no waiting.

### 3 Parametric Triggers
| Trigger | Threshold | Auto-Payout |
|---------|-----------|-------------|
| Rainfall | > 10 mm/hr | 4 hrs income |
| Temperature | > 40 °C | 3 hrs income |
| AQI | > 200 | 2 hrs income |

---

## 🗂 Project Structure

```
suraksha-pay/
├── frontend/          React + Vite + Tailwind CSS
│   └── src/
│       ├── pages/     LandingPage, Login, Register, Dashboard,
│       │              PolicyPage, ClaimsPage, AdminDashboard
│       ├── components/ Layout (sidebar + topbar)
│       ├── context/   AuthContext (JWT)
│       └── utils/     axios instance
│
├── backend/           Node.js + Express
│   ├── models/        User, Policy, Claim, FraudLog
│   ├── controllers/   auth, weather, policies, claims, admin
│   ├── routes/        REST endpoints
│   └── middleware/    JWT protect, adminOnly
│
├── ai-service/        Python FastAPI microservice
│   └── main.py        Risk scoring, safe-hours AI, trigger checker
│
└── database/
    ├── schema.js      MongoDB collection design + indexes
    └── seed.js        Demo data seeder
```

---

## ⚡ Quick Start (5 minutes)

### Prerequisites
- Node.js v18+
- Python 3.9+
- MongoDB (local or Atlas free tier)

---

### 1 — Clone & Setup

```bash
git clone <repo-url>
cd suraksha-pay
```

---

### 2 — Backend

```bash
cd backend
npm install

# Edit .env if needed (default uses localhost MongoDB)
# MONGODB_URI=mongodb://localhost:27017/surakshapay
# JWT_SECRET=suraksha_pay_secret_key_2024_hackathon

npm run dev
# → Server on http://localhost:5000
```

---

### 3 — Seed Demo Data

```bash
# In a new terminal, from the backend folder:
cd backend
node ../database/seed.js
```

This creates:
- **Admin**: `admin@surakshapay.in` / `Admin@123`
- **Worker 1**: `raju@demo.com` / `Demo@123`
- **Worker 2**: `priya@demo.com` / `Demo@123`
- **Worker 3**: `arjun@demo.com` / `Demo@123`

---

### 4 — AI Service (Python)

```bash
cd ai-service
python -m venv venv

# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# → AI Service on http://localhost:8000
```

> **Note:** The backend works without the AI service — it falls back to built-in risk scoring. The AI service enhances accuracy.

---

### 5 — Frontend

```bash
cd frontend
npm install
npm run dev
# → App on http://localhost:5173
```

---

### 6 — Open & Demo

1. Visit `http://localhost:5173`
2. Click **"Demo Login"** → Worker login
3. Go to **My Policy** → click **"Generate Policy (AI-Priced)"**
4. Return to **Dashboard** → click **"Simulate Rain"** 🌧
5. Watch the auto-payout trigger!

---

## 🔐 Environment Variables

### Backend (`backend/.env`)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/surakshapay
JWT_SECRET=suraksha_pay_secret_key_2024_hackathon
AI_SERVICE_URL=http://localhost:8000
NODE_ENV=development
```

### MongoDB Atlas (optional)
Replace `MONGODB_URI` with your Atlas connection string:
```
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/surakshapay
```

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET  | `/api/auth/me` | Get current user |

### Policies
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/policies/generate` | AI-generate weekly policy |
| GET  | `/api/policies/active` | Get active policy |
| GET  | `/api/policies/my` | All user policies |

### Claims
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/claims/simulate` | Simulate trigger + auto-payout |
| GET  | `/api/claims/my` | Claim history |

### Weather
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/api/weather/:city` | Live weather (Open-Meteo / mock) |
| POST | `/api/weather/simulate-rain` | Simulated extreme rain data |

### Admin (admin role only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/api/admin/stats` | Full platform stats |
| GET  | `/api/admin/users` | All users |
| POST | `/api/admin/resolve-fraud/:id` | Resolve fraud alert |

### AI Service (Python, port 8000)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/risk-score` | AI risk score + premium |
| POST | `/check-triggers` | Check active weather triggers |
| POST | `/simulate-extreme` | Extreme weather simulation |

---

## 🤖 AI/ML Logic

### Risk Scoring Model (`ai-service/main.py`)
Uses a **weighted feature vector** (numpy dot product):

```
Features:  [city_base_risk, monsoon_season, rain_factor, heat_factor, aqi_factor, income_factor]
Weights:   [     0.35,           0.15,          0.20,       0.15,       0.10,          0.05    ]
Score:     dot(features, weights) → clipped to [0.0, 1.0]
```

### Premium Formula
```
Weekly Premium = ₹20 (base)
              + ₹0/8/15 (rain risk)
              + ₹0/5/10 (heat risk)  
              + ₹0/5/10 (AQI risk)
              + risk_score × 20 (dynamic multiplier)
```

### Safe Hours Suggestion
AI evaluates hourly temperature + rain probability from Open-Meteo
and suggests the top 6 safest working windows.

---

## 🕵️ Fraud Detection

Four automated checks on every claim:

1. **Duplicate Claim** — same user, same trigger type, same day → flagged
2. **GPS Mismatch** — simulated 15% random mismatch → logged
3. **Unrealistic Hours** — claims > 12h → auto-rejected
4. **Multiple Claims** — > 3 approved claims in one policy period → logged

Flagged claims are visible in the Admin Dashboard with a Resolve button.

---

## 📹 2-Minute Demo Script

```
[0:00] PROBLEM
"15 crore gig workers in India lose income every time it rains.
No insurance covers them. Today, that changes."

[0:20] SOLUTION — Show landing page
"SurakshaPay uses real weather data and AI to provide
weekly income protection for delivery workers."

[0:35] REGISTER
"Register takes 2 minutes — name, city, platform, income."

[0:45] GENERATE POLICY
"Our AI instantly calculates your risk score based on live weather.
₹65/week for Mumbai in monsoon season."

[1:00] DASHBOARD
"Raju is covered. Live weather shows 32°C, safe for now."

[1:10] SIMULATE RAIN — CLICK THE BUTTON
"It's raining 45mm/hr in Mumbai."
[watch payout notification appear]
"₹325 credited to Raju's account. Automatically. In seconds."

[1:20] CLAIMS PAGE
"Full claim history. Trigger type, payout, status.
Zero manual action by the worker."

[1:35] ADMIN PANEL
"Operators see real-time fraud detection, high-risk zones,
payout totals. Full oversight."

[1:50] CLOSE
"SurakshaPay — because gig workers deserve to earn
even when the sky decides to pour."
```

---

## 🏆 Hackathon Differentiators

- ✅ **100% Free Stack** — Open-Meteo, MongoDB Atlas free, no paid APIs
- ✅ **Parametric** — Zero manual claims, fully automated
- ✅ **AI Risk Model** — Numpy weighted feature vector with city + monsoon intelligence
- ✅ **Fraud Detection** — 4 automated checks, admin resolution workflow
- ✅ **Safe Hours AI** — Tells workers the best time to earn
- ✅ **Demo Impact** — "Simulate Rain" button for instant live demo
- ✅ **Real Indian Data** — 12 cities, actual coordinates, realistic incomes
- ✅ **Production-Ready** — JWT auth, error handling, input validation throughout

---

## 📦 Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Recharts, React Router |
| Backend | Node.js, Express.js, Mongoose, node-cron, JWT |
| Database | MongoDB (Atlas or local) |
| AI Service | Python FastAPI, NumPy, scikit-learn, Uvicorn |
| Weather | Open-Meteo API (free, no key) with mock fallback |
| Payments | Simulated (₹XX credited — no real gateway) |

---

*Built with ❤️ for India's gig economy workers.*
