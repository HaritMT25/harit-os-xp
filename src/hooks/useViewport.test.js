import { describe, it, expect, beforeEach } from 'vitest'
import { fitToViewport, TASKBAR_HEIGHT } from './useViewport'

function setViewport(w, h) {
  Object.defineProperty(window, 'innerWidth', { value: w, configurable: true, writable: true })
  Object.defineProperty(window, 'innerHeight', { value: h, configurable: true, writable: true })
}

describe('fitToViewport', () => {
  beforeEach(() => setViewport(1280, 800))

  it('keeps windows that already fit', () => {
    const { position, size } = fitToViewport({ x: 100, y: 50 }, { w: 500, h: 400 })
    expect(position).toEqual({ x: 100, y: 50 })
    expect(size).toEqual({ w: 500, h: 400 })
  })

  it('shrinks windows larger than the viewport', () => {
    setViewport(800, 600)
    const { size } = fitToViewport({ x: 0, y: 0 }, { w: 880, h: 620 })
    expect(size.w).toBeLessThanOrEqual(800 - 16)
    expect(size.h).toBeLessThanOrEqual(600 - TASKBAR_HEIGHT - 16)
  })

  it('pulls off-screen windows back into view', () => {
    const { position, size } = fitToViewport({ x: 2000, y: 1500 }, { w: 400, h: 300 })
    expect(position.x + size.w).toBeLessThanOrEqual(1280)
    expect(position.y + size.h).toBeLessThanOrEqual(800 - TASKBAR_HEIGHT)
  })

  it('never returns negative positions', () => {
    const { position } = fitToViewport({ x: -500, y: -50 }, { w: 400, h: 300 })
    expect(position.x).toBeGreaterThanOrEqual(0)
    expect(position.y).toBeGreaterThanOrEqual(0)
  })
})
