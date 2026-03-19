# SurakshaPay

See `docs/README.md` for the full setup guide.

## Quick Start

```bash
# Terminal 1 — Backend
cd backend && npm install && npm run dev

# Terminal 2 — Seed data (run once)
cd backend && node ../database/seed.js

# Terminal 3 — AI Service
cd ai-service && pip install -r requirements.txt && uvicorn main:app --port 8000 --reload

# Terminal 4 — Frontend
cd frontend && npm install && npm run dev
```

Open http://localhost:5173

Demo login: `raju@demo.com` / `Demo@123`
Admin login: `admin@surakshapay.in` / `Admin@123`
