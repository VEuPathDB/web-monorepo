import { getTree, nodeHasProperty, OntologyNode } from '../Utils/OntologyUtils';

export type SiteMapOntology = OntologyNode<{}>;

import { ActionThunk } from '../Core/WdkMiddleware';

export type Action =
  | LoadingAction
  | InitializeAction
  | UpdateExpansionAction
  | SetSearchTextAction
  | ErrorAction;

//==============================================================================

export const LOADING = 'sitemap/loading';

export type LoadingAction = {
  type: typeof LOADING;
};

export function loading(): LoadingAction {
  return {
    type: LOADING,
  };
}

//==============================================================================

export const INITIALIZE = 'sitemap/initialize';

export type InitializeAction = {
  type: typeof INITIALIZE;
  payload: {
    tree: SiteMapOntology;
  };
};

export function initialize(tree: SiteMapOntology): InitializeAction {
  return {
    type: INITIALIZE,
    payload: {
      tree,
    },
  };
}

//==============================================================================

export const UPDATE_EXPANSION = 'sitemap/updateExpansion';

export type UpdateExpansionAction = {
  type: typeof UPDATE_EXPANSION;
  payload: {
    expandedList: string[];
  };
};

export function updateExpansion(expandedList: string[]): UpdateExpansionAction {
  return {
    type: UPDATE_EXPANSION,
    payload: {
      expandedList,
    },
  };
}

//==============================================================================

export const SET_SEARCH_TEXT = 'sitemap/set-search-text';

export type SetSearchTextAction = {
  type: typeof SET_SEARCH_TEXT;
  payload: {
    searchText: string;
  };
};

export function setSearchText(searchText: string): SetSearchTextAction {
  return {
    type: SET_SEARCH_TEXT,
    payload: {
      searchText,
    },
  };
}

//==============================================================================

export const SITEMAP_ERROR = 'sitemap/error';

export type ErrorAction = {
  type: typeof SITEMAP_ERROR;
  payload: {
    error: Error;
  };
};

export function sitemapError(error: Error): ErrorAction {
  return {
    type: SITEMAP_ERROR,
    payload: {
      error,
    },
  };
}

//==============================================================================

export function loadCurrentSiteMap(): ActionThunk<
  LoadingAction | ErrorAction | InitializeAction
> {
  return function run({ wdkService }) {
    let ontologyPromise = wdkService.getOntology('SiteMap');

    let isQualifying = (node: SiteMapOntology) => {
      return (
        nodeHasProperty('scope', 'record', node) ||
        nodeHasProperty('scope', 'menu', node) ||
        nodeHasProperty('scope', 'webservice', node) ||
        nodeHasProperty('scope', 'gbrowse', node) ||
        nodeHasProperty('targetType', 'track', node)
      );
    };

    return [
      loading(),
      ontologyPromise.then(
        (ontology) => initialize(getTree(ontology, isQualifying)),
        (error) => sitemapError(error)
      ),
    ];
  };
}
