import { rootElement, rootUrl, endpoint } from './constants';
window.__asset_path_remove_me_please__ = '/';
window.__OUTPUT_SUBDIR__ = '';
window.__DEV__ = process.env.NODE_ENV !== 'production';
window.__SITE_CONFIG__ = {
  rootUrl,
  rootElement,
  endpoint,
  // projectId: process.env.PROJECT_ID
};
