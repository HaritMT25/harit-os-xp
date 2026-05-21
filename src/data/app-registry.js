import { lazy } from 'react'

// ─── App Registry ────────────────────────────────────────
// Single source of truth for every app in HaritOS XP.
// To add a new app: add one entry here + create the component file. Done.
//
// Fields:
//   id            – unique key used everywhere
//   label         – display name in desktop, taskbar tabs
//   windowTitle   – title bar text (falls back to label)
//   icon          – emoji shown in desktop, taskbar, start menu, title bar
//   desc          – start menu description text
//   window        – { position, size } defaults for the window manager
//   desktop       – { x, y, fromRight? } icon placement, or null to hide from desktop
//   startMenu     – true to show in start menu left column
//   component     – lazy-loaded React component

const APP_REGISTRY = {
  about: {
    id: 'about',
    label: 'About Me',
    icon: '👤',
    desc: 'View my profile',
    window: { position: { x: 80, y: 50 }, size: { w: 520, h: 440 } },
    desktop: { x: 16, y: 12 },
    startMenu: true,
    component: lazy(() => import('../apps/AboutMe')),
  },
  resume: {
    id: 'resume',
    label: 'My Resume',
    icon: '📄',
    desc: 'Experience & education',
    window: { position: { x: 120, y: 70 }, size: { w: 600, h: 520 } },
    desktop: { x: 16, y: 92 },
    startMenu: true,
    component: lazy(() => import('../apps/ResumeViewer')),
  },
  projects: {
    id: 'projects',
    label: 'My Projects',
    windowTitle: 'My Projects — Explorer',
    icon: '📁',
    desc: 'Portfolio of work',
    window: { position: { x: 160, y: 40 }, size: { w: 680, h: 520 } },
    desktop: { x: 16, y: 172 },
    startMenu: true,
    component: lazy(() => import('../apps/ProjectExplorer')),
  },
  skills: {
    id: 'skills',
    label: 'Skills',
    windowTitle: 'Skills & Technologies',
    icon: '⚙️',
    desc: 'Technologies I use',
    window: { position: { x: 100, y: 90 }, size: { w: 500, h: 440 } },
    desktop: { x: 16, y: 252 },
    startMenu: true,
    component: lazy(() => import('../apps/SkillsPanel')),
  },
  contact: {
    id: 'contact',
    label: 'Contact Me',
    windowTitle: 'Contact Me — Outlook Express',
    icon: '✉️',
    desc: 'Get in touch',
    window: { position: { x: 200, y: 60 }, size: { w: 460, h: 380 } },
    desktop: { x: 16, y: 332 },
    startMenu: true,
    component: lazy(() => import('../apps/ContactOutlook')),
  },
  terminal: {
    id: 'terminal',
    label: 'Terminal',
    windowTitle: 'C:\\WINDOWS\\system32\\cmd.exe',
    icon: '💻',
    desc: 'System terminal',
    window: { position: { x: 140, y: 80 }, size: { w: 580, h: 400 } },
    desktop: { x: 16, y: 412 },
    startMenu: true,
    startMenuLabel: 'Command Prompt',
    component: lazy(() => import('../apps/Terminal')),
  },
  ie: {
    id: 'ie',
    label: 'Internet Explorer',
    windowTitle: 'Internet Explorer — Live Demos',
    icon: '🌐',
    desc: 'Live project demos',
    window: { position: { x: 60, y: 30 }, size: { w: 880, h: 620 } },
    desktop: { x: -90, y: 92, fromRight: true },
    desktopLabel: 'Internet\nExplorer',
    startMenu: true,
    component: lazy(() => import('../apps/InternetExplorer')),
  },
  notepad: {
    id: 'notepad',
    label: 'Notepad',
    windowTitle: 'Untitled - Notepad',
    icon: '📝',
    desc: 'Text editor',
    window: { position: { x: 180, y: 50 }, size: { w: 480, h: 400 } },
    desktop: { x: -90, y: 172, fromRight: true },
    startMenu: false,
    component: lazy(() => import('../apps/Notepad')),
  },
  minesweeper: {
    id: 'minesweeper',
    label: 'Minesweeper',
    icon: '💣',
    desc: 'Classic game',
    window: { position: { x: 220, y: 60 }, size: { w: 300, h: 380 } },
    desktop: { x: -90, y: 252, fromRight: true },
    startMenu: false,
    component: lazy(() => import('../apps/Minesweeper')),
  },
  ai: {
    id: 'ai',
    label: 'HaritBot',
    windowTitle: 'HaritBot — AI Assistant',
    icon: '🤖',
    desc: 'AI assistant (ask me anything)',
    window: { position: { x: 100, y: 40 }, size: { w: 420, h: 500 } },
    desktop: { x: -90, y: 12, fromRight: true },
    startMenu: true,
    component: lazy(() => import('../apps/AIAssistant')),
  },
  visitor: {
    id: 'visitor',
    label: 'Visitor Map',
    icon: '🌍',
    desc: 'See who visited',
    window: { position: { x: 100, y: 40 }, size: { w: 560, h: 420 } },
    desktop: { x: 350, y: 12 },
    startMenu: false,
    component: lazy(() => import('../apps/VisitorMap')),
  },
}

export default APP_REGISTRY

// ─── Derived lookups (computed once, used by consumers) ───

// Desktop icons: apps that have a desktop placement
export const DESKTOP_APPS = Object.values(APP_REGISTRY).filter(a => a.desktop)

// Start menu items: apps flagged for the start menu
export const START_MENU_APPS = Object.values(APP_REGISTRY).filter(a => a.startMenu)

// Helper: get window title (falls back to label)
export function getWindowTitle(id) {
  const app = APP_REGISTRY[id]
  if (!app) return { title: id, icon: '📋' }
  return { title: app.windowTitle || app.label, icon: app.icon }
}

// Helper: get default window position and size
export function getWindowDefaults(id) {
  const app = APP_REGISTRY[id]
  if (!app) return { position: { x: 100, y: 50 }, size: { w: 500, h: 400 } }
  return { position: { ...app.window.position }, size: { ...app.window.size } }
}
