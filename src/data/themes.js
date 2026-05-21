// ─── XP Luna Themes ──────────────────────────────────────
// CSS variable overrides for each Luna color scheme.
// Single owner of document.documentElement theme mutations.

export const THEMES = {
  blue: {
    '--xp-titlebar-active': 'linear-gradient(180deg, #0997ff 0%, #0053ee 8%, #0050ee 18%, #196be7 30%, #0058e6 50%, #0048d0 70%, #0040c8 85%, #0058e6 100%)',
    '--xp-taskbar': 'linear-gradient(180deg, #1f5fc7 0%, #2463ca 2%, #245ec4 10%, #1850b5 50%, #2260c5 95%, #2968cd 100%)',
    '--xp-start-bg': 'linear-gradient(180deg, #5db643 0%, #3d9a29 25%, #318e1c 50%, #267c11 85%, #24790f 100%)',
  },
  silver: {
    '--xp-titlebar-active': 'linear-gradient(180deg, #b8c7d8 0%, #8ea4bc 10%, #7a94b0 30%, #6d87a3 50%, #7a94b0 70%, #8ea4bc 90%, #a0b4c8 100%)',
    '--xp-taskbar': 'linear-gradient(180deg, #93a5b8 0%, #8498ac 10%, #768ca0 50%, #8498ac 90%, #93a5b8 100%)',
    '--xp-start-bg': 'linear-gradient(180deg, #5888b0 0%, #4878a0 25%, #3a6890 50%, #305880 85%, #284870 100%)',
  },
  olive: {
    '--xp-titlebar-active': 'linear-gradient(180deg, #a8b87a 0%, #8a9e5c 10%, #7a8e4c 30%, #6a7e3c 50%, #7a8e4c 70%, #8a9e5c 90%, #98ae68 100%)',
    '--xp-taskbar': 'linear-gradient(180deg, #8a9860 0%, #7a8850 10%, #6a7840 50%, #7a8850 90%, #8a9860 100%)',
    '--xp-start-bg': 'linear-gradient(180deg, #7a9040 0%, #6a8030 25%, #5a7020 50%, #4a6010 85%, #3a5000 100%)',
  },
}

export const THEME_NAMES = Object.keys(THEMES)

export function getCurrentTheme() {
  return document.documentElement.getAttribute('data-theme') || 'blue'
}

export function applyTheme(name) {
  const vars = THEMES[name]
  if (!vars) return false
  Object.entries(vars).forEach(([key, val]) => {
    document.documentElement.style.setProperty(key, val)
  })
  document.documentElement.setAttribute('data-theme', name)
  return true
}

export function clearTheme() {
  document.documentElement.removeAttribute('data-theme')
  document.documentElement.removeAttribute('style')
}
