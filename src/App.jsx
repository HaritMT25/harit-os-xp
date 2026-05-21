import { useCallback, useEffect, lazy, Suspense, memo } from 'react'
import { useWindowManager } from './hooks/useWindowManager'
import { useAppMode } from './hooks/useAppMode'
import { useVisitorTracking } from './hooks/useVisitorTracking'
import { useSounds } from './hooks/useSounds'
import { on } from './hooks/eventBus'
import { clearTheme } from './data/themes'
import ErrorBoundary from './components/ErrorBoundary'

// ── Eager loads (needed immediately) ──
import LandingPage from './components/LandingPage'

// ── Lazy loads (split into separate chunks) ──
const QuickPortfolio = lazy(() => import('./components/QuickPortfolio'))
const BootSequence   = lazy(() => import('./components/Boot/BootSequence'))
const ShutdownScreen = lazy(() => import('./components/ShutdownScreen'))
const Desktop        = lazy(() => import('./components/Desktop/Desktop'))
const Window         = lazy(() => import('./components/Window/Window'))
const Taskbar        = lazy(() => import('./components/Taskbar/Taskbar'))
const WelcomeDialog  = lazy(() => import('./components/WelcomeDialog'))
const Clippy         = lazy(() => import('./components/Clippy'))
const MSNPopup       = lazy(() => import('./components/MSNPopup'))

// ── App components (registry-driven, loaded on-demand when window opens) ──
import APP_REGISTRY from './data/app-registry'

// ── Loading fallbacks ──
function ScreenLoader() {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#000',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        display: 'flex', gap: 6,
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 10, height: 10, borderRadius: '50%', background: '#4fc3f7',
            animation: `pulse 1.2s ease-in-out ${i * 0.3}s infinite`,
          }} />
        ))}
      </div>
    </div>
  )
}

function WindowLoader() {
  return (
    <div style={{
      height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#fff', fontFamily: "'Tahoma', sans-serif", fontSize: 12, color: '#888',
    }}>
      Loading...
    </div>
  )
}

// ── Memoized window wrapper (prevents re-render of all windows when one changes) ──
const AppWindow = memo(function AppWindow({
  win, zIndex, isActive, onFocus, onClose, onMinimize, onMaximize, onMove, onResize,
}) {
  const AppComponent = APP_REGISTRY[win.id]?.component
  if (!AppComponent) return null

  return (
    <Suspense fallback={<ScreenLoader />}>
      <Window
        id={win.id}
        windowState={win}
        zIndex={zIndex}
        isActive={isActive}
        onFocus={onFocus}
        onClose={onClose}
        onMinimize={onMinimize}
        onMaximize={onMaximize}
        onMove={onMove}
        onResize={onResize}
      >
        <ErrorBoundary>
          <Suspense fallback={<WindowLoader />}>
            <AppComponent />
          </Suspense>
        </ErrorBoundary>
      </Window>
    </Suspense>
  )
})

// ── Main App ──
export default function App() {
  const { mode, setMode, showWelcome, setShowWelcome, navigate } = useAppMode()
  const { play } = useSounds()

  const {
    windows, windowOrder,
    openWindow, closeWindow, focusWindow,
    minimizeWindow, toggleMaximize,
    moveWindow, resizeWindow,
    taskbarClick, getZIndex, isTopWindow,
  } = useWindowManager()

  useVisitorTracking()

  // ── Mode callbacks ──
  const handleChoose = useCallback((choice) => {
    navigate(choice === 'quick' ? 'quick' : 'booting')
  }, [navigate])

  const handleBootComplete = useCallback(() => {
    setMode('xp')
    play('startup')
  }, [setMode, play])

  const handleShutdownComplete = useCallback(() => {
    clearTheme()
    setMode('landing')
  }, [setMode])

  // ── Window actions ──
  const handleOpenWindow = useCallback((id) => {
    openWindow(id)
    play('click')
  }, [openWindow, play])

  // let any component open windows via eventBus.openWindow(id)
  useEffect(() => {
    return on('openWindow', (id) => { openWindow(id); play('click') })
  }, [openWindow, play])

  const handleCloseWindow = useCallback((id) => {
    closeWindow(id)
    play('close')
  }, [closeWindow, play])

  const handleMinimize = useCallback((id) => {
    minimizeWindow(id)
    play('minimize')
  }, [minimizeWindow, play])

  // ── LANDING ──
  if (mode === 'landing') {
    return <LandingPage onChoose={handleChoose} />
  }

  // ── QUICK PORTFOLIO ──
  if (mode === 'quick') {
    return (
      <Suspense fallback={<ScreenLoader />}>
        <QuickPortfolio onSwitchToXP={() => navigate('booting')} />
      </Suspense>
    )
  }

  // ── BOOTING ──
  if (mode === 'booting') {
    return (
      <Suspense fallback={<ScreenLoader />}>
        <BootSequence onComplete={handleBootComplete} />
      </Suspense>
    )
  }

  // ── SHUTTING DOWN ──
  if (mode === 'shutting-down') {
    return (
      <Suspense fallback={<ScreenLoader />}>
        <ShutdownScreen onComplete={handleShutdownComplete} />
      </Suspense>
    )
  }

  // ── XP DESKTOP ──
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Suspense fallback={<ScreenLoader />}>
        <Desktop onOpenWindow={handleOpenWindow} />
      </Suspense>

      {Object.values(windows).map((win) => (
        <AppWindow
          key={win.id}
          win={win}
          zIndex={getZIndex(win.id)}
          isActive={isTopWindow(win.id)}
          onFocus={focusWindow}
          onClose={handleCloseWindow}
          onMinimize={handleMinimize}
          onMaximize={toggleMaximize}
          onMove={moveWindow}
          onResize={resizeWindow}
        />
      ))}

      <Suspense fallback={null}>
        <Taskbar
          windows={windows}
          windowOrder={windowOrder}
          onOpenWindow={handleOpenWindow}
          onTaskbarClick={taskbarClick}
          onNavigate={navigate}
        />
        <Clippy onOpenWindow={handleOpenWindow} delay={12000} />
        <MSNPopup onOpenWindow={handleOpenWindow} delay={18000} />
      </Suspense>

      {showWelcome && (
        <Suspense fallback={null}>
          <WelcomeDialog onClose={() => setShowWelcome(false)} />
        </Suspense>
      )}
    </div>
  )
}
