import { difference, union } from 'lodash';

import {
  BasketStatusErrorAction,
  BasketStatusLoadingAction,
  BasketStatusReceivedAction,
  FavoritesStatusErrorAction,
  FavoritesStatusLoadingAction,
  FavoritesStatusReceivedAction,
} from '../../Views/User/UserActionCreators';
import WdkStore, { BaseState } from '../../Core/State/Stores/WdkStore';
import { CategoryTreeNode, getId, getTargetType } from '../../Utils/CategoryUtils';
import { filterNodes } from '../../Utils/TreeUtils';
import { RecordClass, RecordInstance } from '../../Utils/WdkModel';
import { ServiceError } from '../../Utils/WdkService';
import {
  AllFieldVisibilityAction,
  CategoryExpansionAction,
  NavigationQueryAction,
  NavigationVisibilityAction,
  RecordErrorAction,
  RecordLoadingAction,
  RecordReceivedAction,
  RecordUpdatedAction,
  SectionVisibilityAction,
} from './RecordViewActionCreators';

export type Action = NavigationQueryAction
            | NavigationVisibilityAction
            | RecordErrorAction
            | RecordLoadingAction
            | RecordUpdatedAction
            | RecordReceivedAction
            | SectionVisibilityAction
            | CategoryExpansionAction
            | AllFieldVisibilityAction
            | BasketStatusLoadingAction
            | BasketStatusReceivedAction
            | BasketStatusErrorAction
            | FavoritesStatusLoadingAction
            | FavoritesStatusReceivedAction
            | FavoritesStatusErrorAction

export type State = BaseState & {
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
export default class RecordViewStore extends WdkStore<State> {

  handleAction(state: State, action: Action): State {
    switch (action.type) {

      case 'record-view/active-record-loading':
        return {
          ...state,
          isLoading: true,
          error: undefined,
          requestId: action.id
        };

      case 'record-view/active-record-received': {
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

      case 'record-view/active-record-updated': {
        if (action.id !== state.requestId) return state;
        let { record } = action.payload;
        return { ...state, record };
      }

      case 'record-view/error-received':
        if (action.id !== state.requestId) return state;
        return {
          ...state,
          isLoading: false,
          error: action.payload.error
        };

      case 'record-view/section-visibility-changed': {
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
      case 'record-view/all-field-visibility-changed': {
        return {
          ...state,
          collapsedSections: action.payload.isVisible
            ? difference(state.collapsedSections, getAllFields(state))
            : union(state.collapsedSections, getAllFields(state))
        };
      }

      case 'record-view/navigation-query-changed': {
        return {
          ...state,
          navigationQuery: action.payload.query
        }
      }

      case 'record-view/navigation-visibility-changed': {
        return {
          ...state,
          navigationVisible: action.payload.isVisible
        }
      }

      case 'record-view/navigation-category-expansion-changed':
        return {
          ...state,
          navigationCategoriesExpanded: action.payload.expandedCategories
        }

      case 'user/basket-status-loading':
        return action.payload.record.id === state.record.id
          ? {
            ...state,
            loadingBasketStatus: true
          }
          : state;

      case 'user/basket-status-received':
        return action.payload.record.id === state.record.id
          ? {
            ...state,
            inBasket: action.payload.status,
            loadingBasketStatus: false
          }
          : state;

      case 'user/basket-status-error':
        return action.payload.record.id === state.record.id
          ? {
            ...state,
            basketError: action.payload.error,
            loadingBasketStatus: false
          }
          : state;

      case 'user/favorites-status-loading':
        return action.payload.record.id === state.record.id
          ? {
            ...state,
            loadingFavoritesStatus: true
          }
          : state;

      case 'user/favorites-status-received':
        return action.payload.record.id === state.record.id
          ? {
            ...state,
            favoriteId: action.payload.id,
            loadingFavoritesStatus: false
          }
          : state;

      case 'user/favorites-status-error':
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
