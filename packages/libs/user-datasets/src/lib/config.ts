declare global {
  interface Window {
    __SITE_CONFIG__: { [K in string]?: string };
  }
}

export const { projectId = '', vdiServiceUrl = '' } =
  window.__SITE_CONFIG__ ?? {};
