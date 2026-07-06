# PratibhaPath — Backend

Express API that powers resume analysis, AI suggestions, job matching, and
user accounts.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

The server runs on `http://localhost:5000`. With no values added to `.env`,
the core features (resume analysis, scoring, and global job listings) work
immediately. Everything below is optional and adds an extra feature.

## Optional features and how to enable them

### 1. MongoDB — enables user accounts and analysis history

1. Create a free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free M0 cluster (no credit card required)
3. Under **Database Access**, create a database user (username + password)
4. Under **Network Access**, add `0.0.0.0/0` ("Allow access from anywhere")
5. Click **Connect → Drivers**, copy the connection string, and replace
   `<password>` with your actual database user password
6. Paste it into `.env` as `MONGO_URI=...`

If your password contains special characters (`@`, `#`, `%`, `&`, etc.),
they need to be URL-encoded, or the connection string will fail to parse.
The simplest fix is to use a password with only letters and numbers.

### 2. JWT_SECRET — required if you enable MongoDB/accounts

Generate a random secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Paste the output into `.env` as `JWT_SECRET=...`

### 3. Google Gemini API key — enables AI-generated suggestions

1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
   and sign in with a Google account
2. Click **Create API key** — this is instant and free, no credit card or
   billing setup required
3. Paste it into `.env` as `GEMINI_API_KEY=...`

The free tier covers a generous daily request limit, more than enough for
personal/demo use.

### 4. Adzuna API keys — enables India-specific job listings

1. Sign up for free at [developer.adzuna.com](https://developer.adzuna.com/)
2. Copy your `app_id` and `app_key` from the dashboard
3. Paste them into `.env` as `ADZUNA_APP_ID=...` and `ADZUNA_APP_KEY=...`

If these aren't set, the app automatically falls back to **Arbeitnow**, a
free job board API that requires no signup, though its listings skew
toward remote/global roles rather than India-specific ones.

**Important:** after editing `.env`, you must restart the server
(`Ctrl+C`, then `npm run dev` again) for the new values to take effect.

## API reference

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/analyze` | Optional | Analyzes an uploaded resume. If the request includes a valid auth token, the result is saved to history. |
| GET | `/api/jobs?skills=...&location=...` | No | Returns live job listings ranked by skill match |
| POST | `/api/ai-suggestions` | No | Returns AI-generated suggestions from Gemini |
| POST | `/api/auth/register` | No | Body: `{ name, email, password }` |
| POST | `/api/auth/login` | No | Body: `{ email, password }` |
| GET | `/api/auth/me` | Required | Returns the current authenticated user |
| GET | `/api/history` | Required | Lists the user's past analyses |
| GET | `/api/history/:id` | Required | Returns one analysis in full |
| GET | `/api/history/:id/compare` | Required | Compares an analysis's score to the previous one for the same role |

Routes marked "Required" expect an `Authorization: Bearer <token>` header.

## Folder structure

```
backend/
├── server.js
├── config/db.js                 → MongoDB connection (fails gracefully if unset)
├── models/                      → User.js, Analysis.js
├── middleware/                  → upload.js, auth.js, requireDB.js
├── routes/                      → analyze.js, jobs.js, auth.js, history.js, ai.js
├── controllers/                 → request handlers for each route group
└── utils/
    ├── extractText.js           → PDF/image → raw text
    ├── atsScore.js               → core scoring algorithm
    ├── jobMatcher.js              → ranks jobs against matched skills
    ├── aiClient.js                → Gemini API client
    └── generateToken.js           → JWT helper
```

## Deploying (Render — free tier)

1. Sign up at [render.com](https://render.com), connecting with GitHub
2. Click **New + → Web Service** and connect your repository
3. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
4. In the **Environment** tab, add any of the variables from your `.env`
   that you want active in production (`MONGO_URI`, `JWT_SECRET`,
   `GEMINI_API_KEY`, `ADZUNA_APP_ID`, `ADZUNA_APP_KEY`)
5. Deploy. You'll get a URL like `https://pratibhapath-backend.onrender.com`
   — copy this, you'll need it when deploying the frontend.

Render's free tier sleeps after 15 minutes of inactivity, so the first
request after a period of idle time may take 30–50 seconds to respond.
This is expected behavior on the free tier, not a bug.
