# PratibhaPath — AI Resume Analyzer

PratibhaPath is a full-stack web application that helps job seekers understand
and improve how their resume performs against Applicant Tracking Systems
(ATS) — the software that most companies use to automatically filter resumes
before a human ever sees them. Most resumes get rejected at this stage
without the candidate ever knowing why. PratibhaPath analyzes a resume,
scores it, explains exactly what's missing, and shows real job openings
that match the candidate's current skill set.

## What it does

1. **Upload** — the user uploads their resume as a PDF or image (JPG/PNG)
2. **Analyze** — the backend extracts the text and runs it through a weighted
   scoring algorithm covering keyword relevance, action verbs, quantified
   achievements, formatting, and contact information
3. **Score & insights** — the user sees an overall ATS score, a category
   breakdown, the skills that matched their target role, and the skills
   that are missing
4. **AI suggestions** — a "Get AI suggestions" button calls Google's Gemini
   API to generate suggestions based on the actual content of the resume,
   beyond what the fixed scoring rules can catch
5. **Edit & download** — the user can edit their resume text directly on
   the results page and download an updated copy
6. **Job matches** — based on the skills identified in the resume (and an
   optional location), the app fetches live job listings and ranks them by
   relevance
7. **Account & history** *(optional)* — users can create an account to save
   every analysis and compare score improvements over time

## Tech stack

**Frontend:** React (Vite), Tailwind CSS, Framer Motion (animations),
Recharts (charts), React Router

**Backend:** Node.js, Express, MongoDB/Mongoose (history & auth), JWT
(authentication)

**Integrations:**
- `pdfjs-dist` and `tesseract.js` for PDF and image text extraction
- Google Gemini API for AI-generated suggestions (free tier, no billing required)
- Adzuna API for India-based job listings, with an automatic fallback to
  Arbeitnow (a free, no-key job board) if Adzuna isn't configured

## Project structure

```
pratibhapath/
├── backend/     → Express API, scoring engine, file parsing, auth, AI, jobs
├── frontend/    → React app (pages, components, API client)
├── backend/README.md   → backend setup & deployment instructions
└── frontend/README.md  → frontend setup & deployment instructions
```

## Getting started locally

You'll need two terminals — one for the backend, one for the frontend.

**Terminal 1 — backend**
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

**Terminal 2 — frontend**
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5173` in your browser.

The app works out of the box with no API keys configured — resume scoring,
text extraction, and global job listings (via Arbeitnow) all work
immediately. Optional features (AI suggestions, India-specific jobs, user
accounts/history) require free API keys — see `backend/README.md` for exact
setup steps for each one.

## Deployment

Full step-by-step deployment instructions (Render for the backend, Vercel
for the frontend) are in `backend/README.md` and `frontend/README.md`.

## Status

The core flow — resume upload, text extraction, scoring, and the editor —
has been tested end-to-end with real resumes. The optional integrations
(AI suggestions, job listings, accounts/history) depend on external
services and free API keys that need to be configured individually; test
each one after setting it up to confirm it works as expected in your
environment.

## License

This project is free to use, modify, and build on.
