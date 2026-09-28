// src/config.ts reads this global eagerly at import time and throws if it's
// missing — in the real app it's injected server-side into the page before
// any bundle runs. Mirrors genomics-site's jest.setup.js. The `Window.
// __SITE_CONFIG__` type itself is declared by src/config.ts's global
// augmentation.
window.__SITE_CONFIG__ = window.__SITE_CONFIG__ || { endpoint: '' };
