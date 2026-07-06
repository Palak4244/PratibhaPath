# PratibhaPath — Frontend

React application for PratibhaPath, built with Vite and Tailwind CSS.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5173`. The backend must also be running (see
`backend/README.md`).

## Pages

| Route | File | Auth | Description |
|---|---|---|---|
| `/` | `Home.jsx` | No | Landing page |
| `/upload` | `UploadPage.jsx` | No | Resume upload, target role/company, and location |
| `/results` | `ResultsPage.jsx` | No | Score dashboard, charts, AI suggestions, resume editor, download |
| `/jobs` | `JobsPage.jsx` | No | Live, location-aware job listings |
| `/login`, `/signup` | `Login.jsx`, `Signup.jsx` | No | Authentication forms |
| `/dashboard` | `Dashboard.jsx` | **Yes** | Analysis history and score comparison |

## State management

- `ResumeContext.jsx` — holds the current session's data (name, target
  role/company, location, analysis result)
- `AuthContext.jsx` — holds login state and the JWT token; automatically
  attaches an `Authorization` header to outgoing requests when logged in

## Design system

- **Colors:** defined in `tailwind.config.js` — `bgdeep` (background),
  `cyan`/`teal` (accents), `rose` (errors/missing items), `slate` (muted text)
- **Fonts:** `font-display` (Sora, used for headings), `font-body` (Inter),
  `font-data` (JetBrains Mono, used for numbers/scores)
- **`.glass`** utility class (in `index.css`) — the glassmorphic card style
  used throughout the app
- **Key components:**
  - `Logo.jsx` — brand mark, shown in the top-left of the navbar on every page
  - `Navbar.jsx` / `Footer.jsx` — shared layout, wrapped around all routes in `App.jsx`
  - `AnimatedBackground.jsx` — the ambient animated background behind every page
  - `ResumeScanIllustration.jsx` — the animated illustration on the homepage hero
  - `PathStepper.jsx` — the Upload → Score → Optimize → Apply progress indicator

Animations are built with `framer-motion`; charts use `recharts`; icons use
`lucide-react`.

## Environment variables

```
VITE_API_URL=http://localhost:5000/api
```

Update this to point at your deployed backend URL when deploying to
production.

## Deploying (Vercel — free tier)

1. Sign up at [vercel.com](https://vercel.com), connecting with GitHub
2. Click **Add New → Project** and import your repository
3. Configure:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite (auto-detected)
4. Under **Environment Variables**, add:
   - `VITE_API_URL` = your deployed backend URL + `/api`
     (e.g. `https://pratibhapath-backend.onrender.com/api`)
5. Deploy.

**Note:** if you change the backend URL later, you'll need to update the
environment variable in Vercel's dashboard and manually trigger a
**Redeploy** — changing an environment variable alone does not
automatically redeploy the site.
