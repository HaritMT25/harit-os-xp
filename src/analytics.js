/**
 * GA4 instrumentation for a hash-routed SPA.
 *
 * Why this file exists: gtag.js sends exactly one page_view on initial load.
 * harit-os-xp routes with URL hashes (#quick, #xp) and opens "apps" without
 * navigating, so without manual events GA4 reports one pageview per visitor
 * and nothing about what they actually did.
 *
 * Setup:
 *   1. Put the gtag snippet in index.html (see README) with send_page_view: false
 *   2. Set VITE_GA4_MEASUREMENT_ID in Vercel env vars
 *   3. Call initAnalytics() once from App.jsx
 */

const MEASUREMENT_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID;
const DEBUG = import.meta.env.DEV;

function gtagReady() {
  return typeof window !== "undefined" && typeof window.gtag === "function";
}

/** Map a hash route to a readable page path GA4 can group on. */
function routeToPath(hash) {
  const h = (hash || "").replace(/^#/, "").split("?")[0];
  if (!h) return "/";
  if (h === "quick") return "/quick-view";
  if (h === "xp") return "/xp-desktop";
  return "/" + h;
}

function routeToTitle(path) {
  const titles = {
    "/": "Landing - mode chooser",
    "/quick-view": "Quick portfolio",
    "/xp-desktop": "XP desktop",
  };
  return titles[path] || path;
}

let lastPath = null;

/**
 * App-mode -> page path. This app routes on a `mode` state value from
 * useAppMode rather than on real URLs, so mode transitions are the thing
 * that corresponds to a "page" for reporting purposes.
 */
const MODE_PATHS = {
  landing: "/",
  quick: "/quick-view",
  booting: "/booting",
  xp: "/xp-desktop",
  "shutting-down": "/shutting-down",
};

const MODE_TITLES = {
  landing: "Landing - mode chooser",
  quick: "Quick portfolio",
  booting: "Boot sequence",
  xp: "XP desktop",
  "shutting-down": "Shutdown",
};

/** Send a page_view for the current app mode. Deduped. */
export function trackModeView(mode) {
  if (!gtagReady()) return;
  const path = MODE_PATHS[mode] || "/" + String(mode || "unknown");
  if (path === lastPath) return;
  lastPath = path;

  window.gtag("event", "page_view", {
    page_path: path,
    page_title: MODE_TITLES[mode] || path,
    page_location: window.location.href,
  });
  if (DEBUG) console.debug("[ga4] page_view", path);
}

/** Send a page_view. Deduped, because hashchange can fire twice. */
export function trackPageView(hash = window.location.hash) {
  if (!gtagReady()) return;
  const path = routeToPath(hash);
  if (path === lastPath) return;
  lastPath = path;

  window.gtag("event", "page_view", {
    page_path: path,
    page_title: routeToTitle(path),
    page_location: window.location.href,
  });
  if (DEBUG) console.debug("[ga4] page_view", path);
}

/**
 * Generic event helper. GA4 event names must be snake_case, <= 40 chars,
 * and parameter values are truncated at 100 chars.
 */
export function trackEvent(name, params = {}) {
  if (!gtagReady()) return;
  const clean = {};
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    clean[k] = typeof v === "string" ? v.slice(0, 100) : v;
  }
  window.gtag("event", name, clean);
  if (DEBUG) console.debug("[ga4] event", name, clean);
}

// ---- domain events -------------------------------------------------------
// These are the ones worth reporting on: which apps a visitor opens tells you
// what the portfolio is actually being used for.

export const trackAppOpen = (appName) =>
  trackEvent("app_open", { app_name: appName });

export const trackAppClose = (appName, secondsOpen) =>
  trackEvent("app_close", { app_name: appName, seconds_open: Math.round(secondsOpen) });

export const trackModeChoice = (mode) =>
  trackEvent("mode_choice", { mode }); // "quick" | "xp"

export const trackBotMessage = (turnIndex) =>
  trackEvent("haritbot_message", { turn_index: turnIndex });

export const trackTerminalCommand = (command) =>
  trackEvent("terminal_command", { command: command.split(" ")[0] });

export const trackResumePrint = () => trackEvent("resume_print");

export const trackOutboundClick = (label, url) =>
  trackEvent("outbound_click", { link_label: label, link_url: url });

/**
 * Scroll/engagement milestone on the quick portfolio, so "did anyone read it"
 * is answerable rather than inferred.
 */
export function trackSectionView(section) {
  trackEvent("section_view", { section_name: section });
}

// ---- init ----------------------------------------------------------------
let initialised = false;

export function initAnalytics() {
  if (initialised || !MEASUREMENT_ID) {
    if (!MEASUREMENT_ID && DEBUG) {
      console.warn("[ga4] VITE_GA4_MEASUREMENT_ID not set - analytics disabled");
    }
    return;
  }
  initialised = true;

  // Pageviews are driven by trackModeView() from App.jsx, since this app
  // routes on mode state. The hashchange listener stays for deep links.
  window.addEventListener("hashchange", () => trackPageView());

  // Time-on-page for a single-page app: gtag's engagement timer stops being
  // meaningful when the "page" never changes, so send an explicit heartbeat.
  let start = Date.now();
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      trackEvent("engaged_time", {
        page_path: lastPath || routeToPath(window.location.hash),
        seconds: Math.round((Date.now() - start) / 1000),
      });
    } else {
      start = Date.now();
    }
  });
}
