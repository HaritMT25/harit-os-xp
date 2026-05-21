# HaritOS XP

An interactive Windows XP-themed portfolio website with a dual-mode interface: a clean modern portfolio for quick browsing and a full XP desktop experience with 10+ apps, an AI assistant, and Minesweeper.

Built with React + Vite. All code is original — no assets or code from any other project were used.

## Quick Start

```bash
npm install
cp .env.example .env   # Add your Groq API key for HaritBot
npm run dev             # http://localhost:3000
```

## Features

**Dual-Mode Interface**
- Landing page with Quick View (~30s) and Full XP Experience (~5min) options
- Mobile auto-routes to Quick View; XP mode is desktop-only
- URL hash routing (`#quick`, `#xp`) for deep linking
- Seamless switching: Log Off → Quick View, Shut Down → Landing (with animation)

**XP Desktop**
- BIOS boot sequence → branded loading screen → welcome dialog
- Draggable, resizable windows with Luna Blue chrome and open/close animations
- Start menu, taskbar with window tabs, system tray with clock
- Desktop icons, right-click context menu
- Three themes via terminal: `theme blue`, `theme silver`, `theme olive`

**Apps**
| App | Description |
|-----|-------------|
| 👤 About Me | Profile card with XP-style sidebar |
| 📄 Resume Viewer | PDF reader-style display with working Print button |
| 📁 Project Explorer | IE-style browser with tile/detail views |
| ⚙️ Skills | Control Panel-style skill categories |
| ✉️ Contact | Outlook Express email compose with reveal flow |
| 🤖 HaritBot | AI assistant powered by Groq (Llama 3.3) with full RAG context |
| 💻 Terminal | Interactive shell with 15+ commands, arrow-key history |
| 🌐 Internet Explorer | Embed live project demos via iframe |
| 📝 Notepad | Editable text app |
| 💣 Minesweeper | Working 9×9 game with timer and flag counter |

**Easter Eggs**
- Clippy appears after 12s with hiring-related quips
- MSN Messenger notification after 18s
- Terminal commands: `neofetch`, `sudo`, `fortune`, `theme`

**Performance**
- Code-split into 21 lazy-loaded chunks (54KB initial load)
- React.memo on window wrappers to prevent cascade re-renders
- Error boundaries per window — one crashed app won't kill the desktop
- XP chunks prefetch while user is on the landing page

## Configuration

All personal data lives in one file: `src/data/resume-data.js`

Update these `// TODO` fields before deploying:
- `personalInfo.email`
- `personalInfo.github`
- `personalInfo.linkedin`
- `personalInfo.website`
- `og:url` in `index.html`

### HaritBot (AI Assistant)

1. Get a free API key at [console.groq.com](https://console.groq.com)
2. Add to `.env`: `VITE_GROQ_API_KEY=gsk_your_key_here`
3. The bot has full context of your resume data and answers recruiter questions

> **Note:** The API key is in the frontend bundle. This is acceptable for Groq's free tier with rate limits. Don't attach billing to this key.

### Embedding Live Projects

Edit `src/apps/InternetExplorer.jsx` — add deployed URLs to the `BOOKMARKS` array.

### Sound Effects

Drop `.mp3` files into `public/sounds/` (startup, click, close, minimize, error, notify). Degrades gracefully if missing.

## Deployment

```bash
npm run build    # Output in dist/
npx vercel       # Deploy to Vercel
```

`vercel.json` is included with SPA routing and iframe headers pre-configured.

## Project Structure

```
src/
├── App.jsx                          # Router + lazy loading orchestrator
├── data/resume-data.js              # Single source of truth for all content
├── shared/Components.jsx            # 8 reusable components (both modes use these)
├── hooks/
│   ├── useWindowManager.js          # Window state (drag, resize, z-order, min/max)
│   └── useSounds.js                 # Sound system with graceful fallback
├── components/
│   ├── LandingPage.jsx              # Mode chooser
│   ├── QuickPortfolio.jsx           # Modern single-page portfolio
│   ├── Boot/BootSequence.jsx        # BIOS → loading → welcome
│   ├── ShutdownScreen.jsx           # "Shutting down..." animation
│   ├── Desktop/Desktop.jsx          # Wallpaper, icons, context menu
│   ├── Window/Window.jsx            # XP chrome, 8 resize handles
│   ├── Taskbar/Taskbar.jsx          # Start menu, tabs, system tray
│   ├── WelcomeDialog.jsx            # First-boot tips + disclaimer
│   ├── ErrorBoundary.jsx            # Per-window crash recovery
│   ├── Clippy.jsx                   # "It looks like you're hiring!"
│   └── MSNPopup.jsx                 # "Harit is online" notification
├── apps/
│   ├── AboutMe.jsx
│   ├── ResumeViewer.jsx
│   ├── ProjectExplorer.jsx
│   ├── SkillsPanel.jsx
│   ├── ContactOutlook.jsx
│   ├── Terminal.jsx
│   ├── InternetExplorer.jsx
│   ├── AIAssistant.jsx
│   ├── Notepad.jsx
│   └── Minesweeper.jsx
└── styles/
    ├── xp-theme.css                 # Luna Blue CSS variables
    ├── animations.css               # All keyframes (consolidated)
    └── print.css                    # Print stylesheet for resume
```

## Disclaimer

This project is a work of parody intended for educational and portfolio purposes. It is an original implementation that evokes a classic operating system aesthetic for the web.

The visual design language of Windows XP, including the Luna theme, is the intellectual property of **Microsoft Corporation**. This project uses no actual Microsoft assets — all visuals are original CSS approximations. No ownership of Microsoft's design language is claimed.

The concept of an OS-themed portfolio is a well-established genre in web development. This project was directly inspired by [Mitch Ivin's XP portfolio](https://mitchivin.com/). All code is original.

## License

[MIT](LICENSE)
