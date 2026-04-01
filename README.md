# Sakhi - Mental Wellness Companion

**Sakhi** (meaning "female friend" in Sanskrit) is a compassionate AI-powered mental wellness platform offering anonymous support, therapeutic conversations, and community connection.

## Live Demo
- **Frontend:** https://sakhi-therapist.vercel.app
- **Backend API:** https://sakhi-2wfh.onrender.com
- **API Docs:** https://sakhi-2wfh.onrender.com/docs

## Features
- **AI Therapist** - Powered by Llama 3 via Groq API, provides warm, personalized conversations
- **Crisis Detection** - Automatic detection with emergency resources (988, 741741)
- **Encrypted Journal** - End-to-end encrypted private entries
- **Anonymous Community** - Share stories and support others
- **Daily Affirmations** - Positive quotes for mental wellness
- **Breathing Exercises** - Guided 4-7-8 and box breathing techniques

## Tech Stack

**Frontend:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
**Backend:** FastAPI, Python 3.11, SQLAlchemy, JWT Authentication
**Database:** PostgreSQL (Supabase)
**AI Model:** Llama 3 via Groq API
**Deployment:** Vercel (frontend), Render (backend)

## Quick Start

### Backend
```bash
cd sakhi-backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Add your DATABASE_URL and GROQ_API_KEY to .env
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd sakhi-frontend
npm install
npm run dev
```

## Environment Variables

**Backend (.env)**
```
DATABASE_URL=postgresql://...
GROQ_API_KEY=your_groq_key
SECRET_KEY=your_secret
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key
```

**Frontend (.env.local)**
```
NEXT_PUBLIC_API_URL=https://sakhi-2wfh.onrender.com
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/signin` | POST | Anonymous sign-in |
| `/api/ai/chat` | POST | Chat with AI therapist |
| `/api/ai/breathing-exercise` | POST | Get breathing guide |
| `/api/ai/crisis-resources` | GET | Emergency resources |
| `/api/journal/entries` | GET/POST | Journal CRUD |
| `/api/community/posts` | GET/POST | Community posts |
| `/api/affirmations/random` | GET | Random affirmation |

## Deployment

- **Frontend:** Connect GitHub repo to Vercel, add `NEXT_PUBLIC_API_URL`
- **Backend:** Connect GitHub repo to Render, add environment variables

## Important Disclaimer

Sakhi is not a replacement for professional therapy. If you're in crisis, please contact emergency services:
- **988** - Suicide & Crisis Lifeline
- **741741** - Crisis Text Line (Text HOME)

## License

MIT

---

**Created by Trisha Soni** | [GitHub](https://github.com/Trisha2910tinaaaaa/Sakhi)
