// URLs of project demos hosted outside this site, shared by the apps that
// open or embed them. An empty URL means "not deployed yet": the apps then
// show it as coming soon instead of embedding a page that does not exist.

// The evo_boids WebAssembly demo, its own static Vercel project. Set it here
// once that project is deployed, or set VITE_EVOBOIDS_URL in this site's
// Vercel environment variables (no code change needed).
export const EVOBOIDS_URL = import.meta.env.VITE_EVOBOIDS_URL || ''
