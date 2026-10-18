import { describe, it, expect } from 'vitest'
import APP_REGISTRY from './app-registry'
import { DEMO_URLS } from './demo-urls'
import { projects } from './resume-data'

describe('project demos', () => {
  it('every demo id has a URL entry and a window that runs it', () => {
    const ids = projects.map(p => p.demo).filter(Boolean)
    expect(ids.length).toBeGreaterThan(0)
    for (const id of ids) {
      expect(id in DEMO_URLS).toBe(true)
      expect(APP_REGISTRY[id]).toBeDefined()
    }
  })
})
