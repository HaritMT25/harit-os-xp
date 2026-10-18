// URLs of project demos hosted outside this site, shared by the apps that
// open or embed them. An empty URL means "not deployed yet": the apps then
// show it as coming soon instead of embedding a page that does not exist.

// The evo_boids WebAssembly demo, its own static Vercel project. Set it here
// once that project is deployed, or set VITE_EVOBOIDS_URL in this site's
// Vercel environment variables (no code change needed).
export const EVOBOIDS_URL = import.meta.env.VITE_EVOBOIDS_URL || ''

// Demo URL per `demo` id on a project in resume-data.js; the id is also the
// app id of the window that runs it. resume-data.js only holds the id because
// the HaritBot serverless function imports it under plain Node, where
// import.meta.env does not exist.
export const DEMO_URLS = { evoboids: EVOBOIDS_URL }
