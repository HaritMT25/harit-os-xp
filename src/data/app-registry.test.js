import { describe, it, expect } from 'vitest'
import APP_REGISTRY, { DESKTOP_APPS, START_MENU_APPS, getWindowDefaults, getWindowTitle } from './app-registry'

describe('app registry', () => {
  it('every app has the required fields', () => {
    for (const [id, app] of Object.entries(APP_REGISTRY)) {
      expect(app.id).toBe(id)
      expect(app.label).toBeTruthy()
      expect(app.icon).toBeTruthy()
      expect(app.component).toBeTruthy()
      expect(app.window?.position).toBeDefined()
      expect(app.window?.size).toBeDefined()
    }
  })

  it('derived lookups cover the right apps', () => {
    expect(DESKTOP_APPS.length).toBeGreaterThan(0)
    expect(DESKTOP_APPS.every(a => a.desktop)).toBe(true)
    expect(START_MENU_APPS.length).toBeGreaterThan(0)
    expect(START_MENU_APPS.every(a => a.startMenu)).toBe(true)
  })

  it('helpers fall back safely for unknown ids', () => {
    expect(getWindowTitle('nope').title).toBe('nope')
    expect(getWindowDefaults('nope').size.w).toBeGreaterThan(0)
  })
})
