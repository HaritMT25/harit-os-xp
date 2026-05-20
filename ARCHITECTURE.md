# Architecture & Design Decisions

Technical documentation for HaritOS XP — an interactive portfolio website.

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | React 18 | Component model fits the window manager paradigm — each app is a self-contained component |
| Build | Vite 5 | Fast HMR in dev, tree-shaking and code splitting in prod |
| Styling | CSS-in-JS (inline styles) + CSS custom properties | XP theme variables in `:root`, component-scoped styles avoid cascade issues |
| Maps | Leaflet (vanilla, no react-leaflet) | react-leaflet had crash issues with React.lazy + StrictMode; plain Leaflet via refs is more stable |
| AI | Groq API (Llama 3.3 70B) | Free tier, fast inference (~200ms), good enough for conversational RAG |
| Persistence | Redis via ioredis (Upstash) | Simple key-value for visitor pins, free tier covers portfolio traffic |
| Analytics | Vercel Analytics | Privacy-compliant (no cookies), zero-config after deploy |
| Hosting | Vercel | Auto-deploys from GitHub, serverless functions for the API route, free tier |
| Geolocation | ipapi.co | Free IP geolocation, no API key, city-level precision |

## Project Structure

```
src/
├── App.jsx                    # mode router + lazy loading orchestrator
├── main.jsx                   # entry point, error boundary, analytics
├── data/
│   └── resume-data.js         # single source of truth for all content
├── shared/
│   ├── Components.jsx         # reusable UI primitives (both modes use these)
│   └── ModeSwitcher.jsx       # unified mode-switching buttons
├── hooks/
│   ├── useWindowManager.js    # window state machine
│   ├── useSounds.js           # audio system with graceful fallback
│   └── eventBus.js            # cross-component communication
├── components/
│   ├── LandingPage.jsx        # mode chooser (Quick View / Full XP)
│   ├── QuickPortfolio.jsx     # modern single-page portfolio
│   ├── Boot/BootSequence.jsx  # BIOS → loading → welcome
│   ├── ShutdownScreen.jsx     # shutdown animation
│   ├── Desktop/Desktop.jsx    # wallpaper, draggable icons, context menu
│   ├── Window/Window.jsx      # XP chrome, drag, resize, SVG buttons
│   ├── Taskbar/Taskbar.jsx    # start menu, tabs, system tray
│   ├── WelcomeDialog.jsx      # first-boot tips + disclaimer
│   ├── ErrorBoundary.jsx      # per-window crash recovery
│   ├── Clippy.jsx             # delayed assistant popup
│   └── MSNPopup.jsx           # delayed notification popup
├── apps/                      # each is a standalone app inside a window
│   ├── AboutMe.jsx
│   ├── ResumeViewer.jsx
│   ├── ProjectExplorer.jsx
│   ├── SkillsPanel.jsx
│   ├── ContactOutlook.jsx
│   ├── AIAssistant.jsx
│   ├── Terminal.jsx
│   ├── InternetExplorer.jsx
│   ├── VisitorMap.jsx
│   ├── Notepad.jsx
│   └── Minesweeper.jsx
├── styles/
│   ├── xp-theme.css           # Luna Blue CSS variables + Safari fixes
│   ├── animations.css         # all keyframes consolidated
│   └── print.css              # print stylesheet for resume
api/
└── visits.js                  # Vercel serverless function for visitor pins
```

## Key Design Decisions

### Dual-Mode Interface

The landing page presents two paths: Quick View (modern portfolio, ~30s) and Full Experience (XP desktop, ~5min). This exists because recruiters scanning 50 portfolios need speed, while someone genuinely interested will explore. Both modes share the same data source and reusable components — update once, reflects everywhere.

### Single Source of Truth

All personal data (experience, projects, skills, education, contact info) lives in `resume-data.js`. Every component imports from it. The terminal commands, AI assistant context, resume viewer, quick portfolio, and about page all pull from the same file. No data duplication, no drift.

### Window Manager

`useWindowManager.js` is a custom hook that manages all window state: positions, sizes, z-order stacking, minimize/maximize/restore, open/close with animation flags. Each window gets a unique z-index based on its position in the `windowOrder` array — clicking a window moves it to the end (top).

Windows support 8-direction resize handles, title bar dragging (mouse + touch), and proper maximization that remembers the previous position/size for restore.

### Code Splitting

`App.jsx` lazy-loads everything except the landing page. Each app component is a separate chunk that loads on demand when its window opens. The initial bundle is ~54KB gzipped — just React + the landing page. XP desktop chunks prefetch in the background while the user is on the landing page.

```
Landing page: 54KB (immediate)
Quick Portfolio: +3KB (on demand)
Boot + Desktop + Taskbar: +12KB (on demand)
Each app: 1-4KB each (on demand)
Leaflet (visitor map): +44KB (on demand)
```

### Error Isolation

Three layers of error boundaries:
1. **Top-level** (main.jsx) — catches anything, shows "Something went wrong" with a reload button. Never a white screen.
2. **Per-window** (App.jsx) — each app window is wrapped in `<ErrorBoundary>`. A crashed Minesweeper won't take down the Terminal.
3. **Per-API-call** — every fetch uses `safeFetchJson()` which catches network errors, non-JSON responses (Vite dev returns HTML for missing routes), and timeouts.

### Touch Support

Desktop icons and window title bars handle both mouse and touch events through unified handlers. On touch devices, a single tap opens an app (since there's no double-click). A 5px movement threshold distinguishes taps from drags. Windows are draggable by their title bar on touch.

### Leaflet (Not react-leaflet)

Started with `react-leaflet` but it crashed consistently on first load due to conflicts between React.lazy, Suspense, and StrictMode. The wrapper tried to initialize a map into a DOM node that React was still managing. Switched to plain Leaflet with `useRef` and `useEffect` — the map attaches to a regular `<div>` after mount. Dynamic `import('leaflet')` keeps it out of the main bundle.

### Visitor Map — Privacy Model

Every visitor is auto-pinned as "Anonymous" with city-level coordinates (rounded to 1 decimal ≈ 11km precision). No IP address is stored. `localStorage` prevents duplicate pins from the same browser. Visitors can optionally upgrade to a named pin (gold dot vs blue dot). The API route (`api/visits.js`) stores pins in Redis with a 1000-entry cap.

### HaritBot — RAG Architecture

The AI assistant builds a text context string from `resume-data.js` on every render and passes it as the system prompt to Groq's Llama 3.3 70B. It's not true vector-search RAG — the entire resume fits in the context window (~2K tokens), so full-context injection works fine. The system prompt instructs the model to be enthusiastic but honest, highlight specific metrics, and never fabricate information.

The bot gracefully degrades: no API key → shows "offline" with grey status dot, no error messages or setup instructions visible to visitors.

### XP Theme System

CSS custom properties in `xp-theme.css` define the Luna Blue palette. The terminal's `theme` command swaps these variables at runtime via `document.documentElement.style.setProperty()`. Three themes: blue (default), silver, olive. Variables reset on shutdown.

Window buttons use inline SVGs instead of Unicode characters (`🗕 🗖 🗗 🗙`) because those render as generic bars on many browsers — the SVG minimize/maximize/close/restore icons are pixel-consistent everywhere.

### Boot Sequence

Four phases: BIOS text crawl (line-by-line reveal with random timing) → branded loading screen with progress bar → "Welcome" screen → desktop fade-in. Each phase is timed with `setTimeout` chains in a `useEffect`. The BIOS text references fake hardware ("Neural Processing Unit @ ∞ GHz") as personality detail.

### Contact — Mailto Approach

The contact form uses `mailto:` links instead of a backend email service. Clicking Send opens the visitor's email client with pre-filled To/Subject/Body. Quick message buttons ("I was here 👋", "Love the portfolio! 🖥️") reduce friction to one click. This avoids the complexity of email APIs (SendGrid, Resend) while being functional.

### Auto-Pin Dedup

`localStorage.setItem('harit_visitor_pinned', 'true')` is set *before* the API call fires, not after. This prevents double-pins from React StrictMode double-mounting, fast refresh, and failed API responses. Even if the Redis write fails, the browser won't retry. One browser = one pin, guaranteed.

## Performance

| Metric | Value |
|--------|-------|
| Initial bundle (gzipped) | 54KB |
| Total chunks | 21 |
| Largest lazy chunk | Leaflet (44KB, loads only when visitor map opens) |
| Time to interactive (landing page) | < 1s |
| Lighthouse Performance (estimated) | 90+ |

## Dependencies

| Package | Purpose | Size Impact |
|---------|---------|-------------|
| react, react-dom | UI framework | Part of main bundle |
| leaflet | Map rendering | 44KB lazy chunk |
| ioredis | Redis client (serverless only) | Not in browser bundle |
| @vercel/analytics | Page view tracking | ~1KB |

Zero UI libraries (no Tailwind, no Material UI, no component library). All styling is inline or CSS custom properties. This keeps the bundle small and avoids version conflicts.

## Deployment

Push to `main` → Vercel auto-builds → deploys to production. Environment variables:
- `VITE_GROQ_API_KEY` — Groq API key for HaritBot (exposed in frontend bundle, free tier)
- `REDIS_URL` — Upstash Redis connection string with TLS (`rediss://`)

The `vercel.json` configures SPA routing (all paths → `index.html`) and permissive iframe headers for the Internet Explorer app.
