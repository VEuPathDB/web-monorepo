import {
  getTree,
  nodeHasProperty,
  OntologyNode
} from '../../Utils/OntologyUtils';

export type SiteMapOntology = OntologyNode<{}>;

import { ActionThunk } from '../../Utils/ActionCreatorUtils';

export type LoadingAction = {
  type: 'sitemap/loading'
}
export type InitializeAction = {
  type: 'sitemap/initialize',
  payload: {
    tree: SiteMapOntology
  }
}
export type ExpansionAction = {
  type: 'sitemap/updateExpanded',
  payload: {
    expandedList: string[]
  }
}
export type SearchAction = {
  type: 'sitemap/setSearchText',
  payload: {
    searchText: string
  }
}
export type ErrorAction = {
  type: 'sitemap/error',
  payload: {
    error: Error
  }
}

export function loadCurrentSiteMap(): ActionThunk<LoadingAction | ErrorAction | InitializeAction> {
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
    }

    return [
      <LoadingAction>{ type: 'sitemap/loading' },
      ontologyPromise.then(
        (ontology) => (<InitializeAction>{
          type: 'sitemap/initialize',
          payload: { tree: getTree(ontology, isQualifying) }
        }),
        error => (<ErrorAction>{
          type: 'sitemap/error',
          payload: { error }
        })
      )
    ];
  }
}

export function updateExpanded (expandedList: string[]): ExpansionAction {
  return {
    type: 'sitemap/updateExpanded',
    payload: { expandedList: expandedList}
  };
}

export function setSearchText (searchText: string): SearchAction {
  return {
    type: 'sitemap/setSearchText',
    payload: { searchText: searchText}
  };
}
