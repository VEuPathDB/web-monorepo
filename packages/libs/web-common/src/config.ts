// __SITE_CONFIG__ is defined in siteConfig.js.j2

declare global {
  interface Window {
    __SITE_CONFIG__: { [K in string]?: string }
  }
}

if (window.__SITE_CONFIG__ == null) {
  throw new Error("`window.__SITE_CONFIG__` must be defined.");
}

export const {
  rootUrl = '',
  rootElement = '',
  endpoint = '',
  projectId = '',
  webAppUrl = '',
  facebookUrl = '',
  twitterUrl = '',
  twitterUrl2 = '',
  youtubeUrl = '',
  redditUrl = '',
  vimeoUrl = '',
  communitySite = '',
  siteSearchServiceUrl = '',
  studyAccessServiceUrl = '',
  retainContainerContent = false
} = window.__SITE_CONFIG__;
