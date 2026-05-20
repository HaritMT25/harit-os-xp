// lightweight event bus — lets apps trigger window opens without prop drilling
const listeners = {}

export function on(event, callback) {
  if (!listeners[event]) listeners[event] = []
  listeners[event].push(callback)
  return () => { listeners[event] = listeners[event].filter(cb => cb !== callback) }
}

export function emit(event, data) {
  (listeners[event] || []).forEach(cb => cb(data))
}

// convenience: open a window from anywhere
export function openWindow(id) { emit('openWindow', id) }
