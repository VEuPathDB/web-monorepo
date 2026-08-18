// Runs before any test module is loaded (via jest's `setupFiles`).
// @veupathdb/web-common/lib/config reads this global eagerly at import
// time and throws if it's missing — in the real app it's injected
// server-side into the page before any bundle runs.
window.__SITE_CONFIG__ = window.__SITE_CONFIG__ || { endpoint: '' };
