import React, { Component } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/xp-theme.css'
import './styles/animations.css'
import './styles/print.css'
import 'leaflet/dist/leaflet.css'
import { inject } from '@vercel/analytics'

inject()

// top-level error boundary — never shows a white screen
class AppErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          width: '100vw', height: '100vh', display: 'flex', alignItems: 'center',
          justifyContent: 'center', background: '#0a0a1a', fontFamily: 'Tahoma, sans-serif',
          flexDirection: 'column', gap: 16,
        }}>
          <div style={{ fontSize: 40 }}>⚠️</div>
          <div style={{ color: '#fff', fontSize: 18, fontWeight: 300 }}>Something went wrong</div>
          <button
            onClick={() => { this.setState({ hasError: false }); window.location.hash = ''; window.location.reload() }}
            style={{
              padding: '8px 24px', border: '1px solid #444', borderRadius: 6,
              background: '#1a1a3e', color: '#fff', cursor: 'pointer', fontSize: 13,
            }}
          >Reload</button>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </React.StrictMode>
)
