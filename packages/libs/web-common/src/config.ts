// __SITE_CONFIG__ is defined in siteConfig.js.j2

declare global {
  interface Window {
    __SITE_CONFIG__: { [K in string]?: string };
  }
}

if (window.__SITE_CONFIG__ == null) {
  throw new Error('`window.__SITE_CONFIG__` must be defined.');
}

export const {
  requireLogin = false,
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
  linkedinUrl = '',
  vimeoUrl = '',
  blueskyUrl = '',
  discordUrl = '',
  communitySite = '',
  siteSearchServiceUrl = '',
  retainContainerContent = false,
  useEda = false,
  edaServiceUrl = '',
  edaSingleAppMode = undefined,
  useUserDatasetsWorkspace = false,
  datasetImportUrl = '',
  showUnreleasedData = false,
  vdiServiceUrl = '',
  userDatasetsUploadTypes = '',
  communityDatasetsEnabled = false,
  showExtraMetadata = false,
  aiExpressionQualtricsId = '',
  showSubscriptionProds = false,
} = window.__SITE_CONFIG__;

export const edaExampleAnalysesAuthors = !window.__SITE_CONFIG__
  .edaExampleAnalysesAuthor
  ? undefined
  : window.__SITE_CONFIG__.edaExampleAnalysesAuthor
      .split(/\s*,\s*/)
      .map((stringVal) => parseInt(stringVal, 10))
      .filter((numberVal) => Number.isInteger(numberVal));

// VEuPathDB project identifiers
export const GENOMICS_PROJECTS = [
  'VEuPathDB',
  'AmoebaDB',
  'CryptoDB',
  'FungiDB',
  'GiardiaDB',
  'HostDB',
  'MicrosporidiaDB',
  'PiroplasmaDB',
  'PlasmoDB',
  'ToxoDB',
  'TrichDB',
  'TriTrypDB',
  'VectorBase',
] as const;

export const OTHER_PROJECTS = [
  'OrthoMCL',
  'ClinEpiDB',
  'MicrobiomeDB',
] as const;

export const ALL_VEUPATHDB_PROJECTS = [
  ...GENOMICS_PROJECTS,
  ...OTHER_PROJECTS,
] as const;
