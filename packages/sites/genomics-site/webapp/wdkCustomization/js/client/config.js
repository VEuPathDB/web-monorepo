// __SITE_CONFIG__ is defined in index.jsp
export const {
  rootUrl,
  rootElement,
  endpoint,
  projectId,
  buildNumber,
  releaseDate,
  webAppUrl,
  facebookUrl,
  twitterUrl,
  youtubeUrl
} = window.__SITE_CONFIG__;

// Question name and search param to use for quick search boxes in header
export const quickSearches = [
  { name: 'GeneBySingleLocusTag', quickSearchParamName: 'single_gene_id', quickSearchDisplayName: 'Gene ID' },
  { name: 'GenesByTextSearch', quickSearchParamName: 'text_expression', quickSearchDisplayName: 'Gene Text Search'}
];
