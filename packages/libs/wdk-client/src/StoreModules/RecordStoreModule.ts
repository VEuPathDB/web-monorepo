import { difference, union } from 'lodash';

import { CategoryTreeNode, getId, getTargetType } from 'wdk-client/Utils/CategoryUtils';
import { filterNodes } from 'wdk-client/Utils/TreeUtils';
import { RecordClass, RecordInstance } from 'wdk-client/Utils/WdkModel';
import { ServiceError } from 'wdk-client/Service/ServiceError';
import { Action } from 'wdk-client/Actions';
import {
  RECORD_LOADING,
  RECORD_RECEIVED,
  RECORD_UPDATE,
  RECORD_ERROR,
  SECTION_VISIBILITY,
  ALL_FIELD_VISIBILITY,
  NAVIGATION_QUERY,
  NAVIGATION_VISIBILITY,
  CATEGORY_EXPANSION
} from 'wdk-client/Actions/RecordActions';
import {
  BASKET_STATUS_LOADING,
  BASKET_STATUS_RECEIVED,
  BASKET_STATUS_ERROR,
  FAVORITES_STATUS_LOADING,
  FAVORITES_STATUS_RECEIVED,
  FAVORITES_STATUS_ERROR
} from 'wdk-client/Actions/UserActions';

export const key = 'record';

export type State = {
  isLoading: boolean;
  record: RecordInstance;
  recordClass: RecordClass;
  categoryTree: CategoryTreeNode;
  requestId: string;
  error?: ServiceError,

  collapsedSections: string[];

  navigationVisible: boolean;
  navigationQuery: string;
  navigationCategoriesExpanded: string[];

  inBasket: boolean;
  loadingBasketStatus: boolean;
  basketError?: Error;

  favoriteId?: number;
  loadingFavoritesStatus: boolean;
  favoritesError?: Error;
}

/** Store for record page */
export function reduce(state: State = {} as State, action: Action): State {
  switch (action.type) {

    case RECORD_LOADING:
      return {
        ...state,
        isLoading: true,
        error: undefined,
        requestId: action.id
      };

    case RECORD_RECEIVED: {
      if (action.id !== state.requestId) return state;
      let { record, recordClass, categoryTree } = action.payload;
      return {
        ...state,
        record,
        recordClass,
        collapsedSections: [],
        navigationCategoriesExpanded: state.navigationCategoriesExpanded || [],
        isLoading: false,
        categoryTree
      };
    }

    case RECORD_UPDATE: {
      if (action.id !== state.requestId) return state;
      let { record } = action.payload;
      return { ...state, record };
    }

    case RECORD_ERROR:
      if (action.id !== state.requestId) return state;
      return {
        ...state,
        isLoading: false,
        error: action.payload.error
      };

    case SECTION_VISIBILITY: {
      let collapsedSections = updateList(
        action.payload.name,
        !action.payload.isVisible,
        state.collapsedSections
      );
      return { ...state, collapsedSections };
    }

    /**
     * Update visibility of all record fields (tables and attributes).
     * Category section collapsed state will be preserved.
     */
    case ALL_FIELD_VISIBILITY: {
      return {
        ...state,
        collapsedSections: action.payload.isVisible
          ? difference(state.collapsedSections, getAllFields(state))
          : union(state.collapsedSections, getAllFields(state))
      };
    }

    case NAVIGATION_QUERY: {
      return {
        ...state,
        navigationQuery: action.payload.query
      }
    }

    case NAVIGATION_VISIBILITY: {
      return {
        ...state,
        navigationVisible: action.payload.isVisible
      }
    }

    case CATEGORY_EXPANSION:
      return {
        ...state,
        navigationCategoriesExpanded: action.payload.expandedCategories
      }

    case BASKET_STATUS_LOADING:
      return action.payload.record.id === state.record.id
        ? {
          ...state,
          loadingBasketStatus: true
        }
        : state;

    case BASKET_STATUS_RECEIVED:
      return action.payload.record.id === state.record.id
        ? {
          ...state,
          inBasket: action.payload.status,
          loadingBasketStatus: false
        }
        : state;

    case BASKET_STATUS_ERROR:
      return action.payload.record.id === state.record.id
        ? {
          ...state,
          basketError: action.payload.error,
          loadingBasketStatus: false
        }
        : state;

    case FAVORITES_STATUS_LOADING:
      return action.payload.record.id === state.record.id
        ? {
          ...state,
          loadingFavoritesStatus: true
        }
        : state;

    case FAVORITES_STATUS_RECEIVED:
      return action.payload.record.id === state.record.id
        ? {
          ...state,
          favoriteId: action.payload.id,
          loadingFavoritesStatus: false
        }
        : state;

    case FAVORITES_STATUS_ERROR:
      return action.payload.record.id === state.record.id
        ? {
          ...state,
          favoritesError: action.payload.error,
          loadingFavoritesStatus: false
        }
        : state;

    default:
      return state;

  }
}

/** Create a new array adding or removing item */
function updateList<T>(item: T, add: boolean, list: T[] = []) {
  return add ? list.concat(item) : list.filter(x => x !== item);
}

/** Get all attributes and tables of active record */
function getAllFields(state: State) {
  return filterNodes(isFieldNode, state.categoryTree)
  .map(getId);
}

/** Test is node is a field node */
function isFieldNode(node: CategoryTreeNode) {
  let targetType = getTargetType(node);
  return targetType === 'attribute' || targetType === 'table';
}
