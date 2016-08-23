// __WDK_CONFIG__ is defined in index.jsp
export let {
  rootUrl,
  rootElement,
  endpoint,
  projectId,
  buildNumber,
  releaseDate,
  webAppUrl,
  facebookId,
  twitterId
} = window.__WDK_CONFIG__;

// Question name and search param to use for quick search boxes in header
export let quickSearches = [
  { name: 'GeneBySingleLocusTag', quickSearchParamName: 'single_gene_id', quickSearchDisplayName: 'Gene ID' },
  { name: 'GenesByTextSearch', quickSearchParamName: 'text_expression', quickSearchDisplayName: 'Gene Text Search'}
];
