// URLs of project demos hosted outside this site, shared by the apps that
// open or embed them.

// The evo_boids WebAssembly demo, its own static Vercel project. The fallback
// is that project's production URL (confirm it after the first deploy);
// VITE_EVOBOIDS_URL overrides it, e.g. to test against a local copy.
export const EVOBOIDS_URL = import.meta.env.VITE_EVOBOIDS_URL || 'https://evo-boids.vercel.app'
