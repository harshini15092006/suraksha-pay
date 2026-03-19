from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import numpy as np
import requests
import random
import math
from datetime import datetime

app = FastAPI(title="SurakshaPay AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── City metadata ──────────────────────────────────────────────────────────────
CITY_DATA = {
    "Mumbai":     {"lat": 19.076, "lon": 72.878, "base_risk": 0.75, "monsoon_months": [6,7,8,9]},
    "Delhi":      {"lat": 28.614, "lon": 77.209, "base_risk": 0.60, "monsoon_months": [7,8,9]},
    "Bangalore":  {"lat": 12.972, "lon": 77.595, "base_risk": 0.45, "monsoon_months": [6,7,8,9,10]},
    "Hyderabad":  {"lat": 17.385, "lon": 78.487, "base_risk": 0.55, "monsoon_months": [7,8,9]},
    "Chennai":    {"lat": 13.083, "lon": 80.271, "base_risk": 0.70, "monsoon_months": [10,11,12]},
    "Kolkata":    {"lat": 22.573, "lon": 88.364, "base_risk": 0.65, "monsoon_months": [6,7,8,9]},
    "Pune":       {"lat": 18.520, "lon": 73.857, "base_risk": 0.50, "monsoon_months": [6,7,8,9]},
    "Ahmedabad":  {"lat": 23.023, "lon": 72.571, "base_risk": 0.55, "monsoon_months": [7,8,9]},
    "Vijayawada": {"lat": 16.506, "lon": 80.648, "base_risk": 0.60, "monsoon_months": [7,8,9,10]},
    "Jaipur":     {"lat": 26.912, "lon": 75.787, "base_risk": 0.45, "monsoon_months": [7,8,9]},
    "Surat":      {"lat": 21.170, "lon": 72.831, "base_risk": 0.65, "monsoon_months": [6,7,8,9]},
    "Lucknow":    {"lat": 26.847, "lon": 80.946, "base_risk": 0.50, "monsoon_months": [7,8,9]},
}

THRESHOLDS = {"rainfall": 10.0, "temperature": 40.0, "aqi": 200.0}

# ─── Schemas ────────────────────────────────────────────────────────────────────
class RiskRequest(BaseModel):
    city: str
    avg_daily_income: float
    avg_daily_hours: float
    platform: str

class WeatherCheckRequest(BaseModel):
    city: str

# ─── Helpers ────────────────────────────────────────────────────────────────────
def fetch_weather(city: str) -> dict:
    """Fetch real weather from Open-Meteo or fall back to mock."""
    cd = CITY_DATA.get(city)
    if not cd:
        return _mock_weather(city)
    try:
        url = (
            f"https://api.open-meteo.com/v1/forecast"
            f"?latitude={cd['lat']}&longitude={cd['lon']}"
            f"&current=temperature_2m,precipitation,windspeed_10m"
            f"&timezone=Asia%2FKolkata"
        )
        r = requests.get(url, timeout=5)
        r.raise_for_status()
        c = r.json()["current"]
        return {
            "temperature": c["temperature_2m"],
            "rainfall": c["precipitation"],
            "windspeed": c["windspeed_10m"],
            "aqi": _mock_aqi(city, c["temperature_2m"]),
            "source": "open-meteo",
        }
    except Exception:
        return _mock_weather(city)


def _mock_aqi(city: str, temp: float) -> float:
    base = {"Delhi": 180, "Mumbai": 120, "Kolkata": 150, "Chennai": 80,
            "Bangalore": 90, "Hyderabad": 100, "Pune": 95, "Ahmedabad": 130,
            "Vijayawada": 85, "Jaipur": 110, "Surat": 115, "Lucknow": 160}.get(city, 100)
    return round(base + random.uniform(-20, 20) + (30 if temp > 38 else 0), 1)


def _mock_weather(city: str) -> dict:
    temp = round(28 + random.uniform(0, 15), 1)
    return {
        "temperature": temp,
        "rainfall": round(random.uniform(0, 5), 1),
        "windspeed": round(random.uniform(5, 25), 1),
        "aqi": _mock_aqi(city, temp),
        "source": "mock",
    }


def compute_risk_score(city: str, weather: dict, income: float, hours: float) -> dict:
    """
    AI risk model using a simple weighted feature vector.
    Weights derived from domain knowledge of Indian gig-work patterns.
    """
    cd = CITY_DATA.get(city, {"base_risk": 0.50, "monsoon_months": [7, 8, 9]})
    month = datetime.now().month

    # Feature engineering
    city_risk       = cd["base_risk"]
    monsoon_bonus   = 0.15 if month in cd["monsoon_months"] else 0.0
    rain_factor     = min(weather["rainfall"] / 20.0, 0.25)   # caps at 0.25
    heat_factor     = max((weather["temperature"] - 35) / 20.0, 0.0)  # positive above 35°C
    aqi_factor      = max((weather["aqi"] - 100) / 400.0, 0.0)
    income_factor   = min(income / 2000.0, 0.10)  # higher income = slightly higher risk score (more to lose)

    # Feature vector (numpy-style weighted sum)
    features = np.array([city_risk, monsoon_bonus, rain_factor, heat_factor, aqi_factor, income_factor])
    weights  = np.array([0.35,       0.15,          0.20,        0.15,        0.10,        0.05])
    raw_score = float(np.dot(features, weights))
    score = round(min(max(raw_score, 0.0), 1.0), 3)

    # Premium breakdown
    BASE = 20
    rain_risk  = 15 if weather["rainfall"] > 5 else (8 if weather["rainfall"] > 2 else 0)
    heat_risk  = 10 if weather["temperature"] > 38 else (5 if weather["temperature"] > 35 else 0)
    aqi_risk   = 10 if weather["aqi"] > 200 else (5 if weather["aqi"] > 150 else 0)
    risk_mult  = round(score * 20)
    total      = BASE + rain_risk + heat_risk + aqi_risk + risk_mult

    return {
        "risk_score": score,
        "risk_level": "High" if score > 0.7 else ("Medium" if score > 0.45 else "Low"),
        "premium": {
            "base": BASE, "rain_risk": rain_risk, "heat_risk": heat_risk,
            "aqi_risk": aqi_risk, "risk_multiplier": risk_mult, "total": total,
        },
        "features": {
            "city_base_risk": round(city_risk, 3),
            "monsoon_season": bool(month in cd["monsoon_months"]),
            "rain_factor": round(float(rain_factor), 3),
            "heat_factor": round(float(heat_factor), 3),
            "aqi_factor": round(float(aqi_factor), 3),
        }
    }


def suggest_safe_hours(weather: dict) -> dict:
    """AI-suggested working hours based on weather conditions."""
    temp = weather["temperature"]
    rain = weather["rainfall"]
    aqi  = weather["aqi"]

    safe, avoid, tips = [], [], []

    # Morning hours (6–10)
    if temp < 36 and rain < 5:
        safe.extend(["6:00–8:00 AM", "8:00–10:00 AM"])
        tips.append("Morning hours are best — cooler temperatures")
    else:
        avoid.append("Morning (heavy rain or heat)")

    # Midday (10–14): almost always avoid in Indian summers
    if temp > 36:
        avoid.append("10 AM–2 PM (extreme heat)")
        tips.append("Avoid midday — heat stroke risk above 36°C")
    
    # Evening hours (17–21)
    if rain < 3:
        safe.extend(["5:00–7:00 PM", "7:00–9:00 PM"])
        tips.append("Evening hours offer good earning potential")
    else:
        avoid.append("Evening (rain risk)")
        tips.append("Rain expected in evening — consider morning shift only")

    # AQI warning
    if aqi > 200:
        tips.append("⚠️ High AQI — wear N95 mask. Limit outdoor time")
    elif aqi > 150:
        tips.append("Moderate AQI — surgical mask recommended")

    expected_income_multiplier = len(safe) * 0.12 + 0.5
    return {
        "safe_hours": safe,
        "avoid_hours": avoid,
        "tips": tips,
        "expected_earning_factor": round(min(expected_income_multiplier, 1.0), 2),
        "recommendation": "Work early morning + evening" if safe else "Avoid working today — conditions are unsafe",
    }


# ─── Endpoints ──────────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "SurakshaPay AI Service running", "timestamp": datetime.now().isoformat()}


@app.post("/risk-score")
def get_risk_score(req: RiskRequest):
    weather = fetch_weather(req.city)
    result  = compute_risk_score(req.city, weather, req.avg_daily_income, req.avg_daily_hours)
    hours   = suggest_safe_hours(weather)
    return {
        "success": True,
        "city": req.city,
        "weather_data": weather,
        **result,
        "safe_hours_suggestion": hours,
    }


@app.post("/check-triggers")
def check_triggers(req: WeatherCheckRequest):
    weather = fetch_weather(req.city)
    triggers = {
        "rainfall":    {"triggered": weather["rainfall"] > THRESHOLDS["rainfall"],    "value": weather["rainfall"],    "threshold": THRESHOLDS["rainfall"]},
        "temperature": {"triggered": weather["temperature"] > THRESHOLDS["temperature"],"value": weather["temperature"],"threshold": THRESHOLDS["temperature"]},
        "aqi":         {"triggered": weather["aqi"] > THRESHOLDS["aqi"],              "value": weather["aqi"],         "threshold": THRESHOLDS["aqi"]},
    }
    active = [k for k, v in triggers.items() if v["triggered"]]
    return {
        "success": True,
        "city": req.city,
        "weather": weather,
        "triggers": triggers,
        "active_triggers": active,
        "claim_recommended": len(active) > 0,
    }


@app.post("/simulate-extreme")
def simulate_extreme(req: WeatherCheckRequest):
    """Returns extreme weather for demo simulation."""
    return {
        "success": True,
        "city": req.city,
        "weather_data": {
            "temperature": 29.5, "rainfall": 45.5,
            "windspeed": 38.2, "aqi": 125, "source": "simulated",
        },
        "triggers": {
            "rainfall":    {"triggered": True,  "value": 45.5, "threshold": 10},
            "temperature": {"triggered": False, "value": 29.5, "threshold": 40},
            "aqi":         {"triggered": False, "value": 125,  "threshold": 200},
        },
        "active_triggers": ["rainfall"],
        "claim_recommended": True,
    }
