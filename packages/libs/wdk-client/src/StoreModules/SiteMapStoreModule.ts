import { Action } from '../Actions';
import {
  SiteMapOntology,
  LOADING,
  INITIALIZE,
  UPDATE_EXPANSION,
  SET_SEARCH_TEXT,
  SITEMAP_ERROR,
} from '../Actions/SiteMapActions';

export const key = 'siteMap';

export type State = {
  tree?: SiteMapOntology;
  isLoading: boolean;
  expandedList: string[];
  searchText: string;
};

const initialState = {
  tree: undefined,
  isLoading: false,
  expandedList: [],
  searchText: '',
};

export function reduce(state: State = initialState, action: Action): State {
  switch (action.type) {
    case LOADING:
      return setSiteMapLoading(state, true);

    case INITIALIZE:
      return initializeSiteMap(state, action.payload.tree);

    case UPDATE_EXPANSION:
      return updateExpanded(state, action.payload.expandedList);

    case SET_SEARCH_TEXT:
      return setSearchText(state, action.payload.searchText);

    case SITEMAP_ERROR:
      return setSiteMapLoading(state, false);

    default:
      return state;
  }
}

function setSiteMapLoading(state: State, isLoading: boolean) {
  return { ...state, isLoading };
}

function initializeSiteMap(state: State, tree: SiteMapOntology) {
  return { ...state, tree, isLoading: false };
}

function setSearchText(state: State, searchText: string) {
  return { ...state, searchText };
}

function updateExpanded(state: State, expandedList: string[]) {
  return { ...state, expandedList };
}
