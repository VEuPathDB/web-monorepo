import { chunk, difference, union, uniq } from 'lodash';
import { ActionsObservable, StateObservable } from 'redux-observable';
import { EMPTY, from, Observable } from 'rxjs';
import { bufferTime, filter, groupBy, mergeMap } from 'rxjs/operators';
import { Action } from 'wdk-client/Actions';
import { ALL_FIELD_VISIBILITY, CATEGORY_EXPANSION, NAVIGATION_QUERY, NAVIGATION_VISIBILITY, RecordUpdatedAction, RECORD_ERROR, RECORD_LOADING, RECORD_RECEIVED, RECORD_UPDATE, RequestPartialRecord, REQUEST_PARTIAL_RECORD, SECTION_VISIBILITY, SET_COLLAPSED_SECTIONS } from 'wdk-client/Actions/RecordActions';
import { BASKET_STATUS_ERROR, BASKET_STATUS_LOADING, BASKET_STATUS_RECEIVED, FAVORITES_STATUS_ERROR, FAVORITES_STATUS_LOADING, FAVORITES_STATUS_RECEIVED } from 'wdk-client/Actions/UserActions';
import { RootState } from 'wdk-client/Core/State/Types';
import { EpicDependencies } from 'wdk-client/Core/Store';
import { ServiceError } from 'wdk-client/Service/ServiceError';
import { CategoryTreeNode, getId, getTargetType } from 'wdk-client/Utils/CategoryUtils';
import { filterNodes } from 'wdk-client/Utils/TreeUtils';
import { RecordClass, RecordInstance } from 'wdk-client/Utils/WdkModel';

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

    case SET_COLLAPSED_SECTIONS: {
      let { names } = action.payload;
      return { ...state, collapsedSections: names };
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
export function getAllFields(state: State) {
  return filterNodes<CategoryTreeNode>(isFieldNode, state.categoryTree)
  .map(getId);
}

/** Test is node is a field node */
function isFieldNode(node: CategoryTreeNode) {
  let targetType = getTargetType(node);
  return targetType === 'attribute' || targetType === 'table';
}

type RecordOptions = {
  attributes: string[];
  tables: string[];
}

export const observe = observeRecordRequests;

function observeRecordRequests(action$: ActionsObservable<Action>, state$: StateObservable<RootState>, deps: EpicDependencies): Observable<Action> {
  return action$.pipe(
    filter((action): action is RequestPartialRecord => action.type === REQUEST_PARTIAL_RECORD),
    groupBy(action => action.id),
    mergeMap(group$ => group$.pipe(
      bufferTime(100),
      mergeMap(actions => chunk(actions, 10)),
      mergeMap((actions: RequestPartialRecord[]) => {
        // build up request object
        if (actions.length === 0) return EMPTY;
        // XXX Assuming recordClassName and primaryKey are the same for a given `id`
        const { id } = actions[0];
        const { recordClassName, primaryKey } = actions[0].payload;
        const options = actions.reduce((options, action) => {
          const { attributes = [], tables = [] } = action.payload;
          return Object.assign(options, {
            attributes: uniq([ ...options.attributes, ...attributes ]),
            tables: uniq([ ...options.tables, ...tables])
          })
        }, { attributes: [], tables: [] } as RecordOptions);
        return from(deps.wdkService.getRecord(recordClassName, primaryKey, options).then(
          record => ({
            type: RECORD_UPDATE,
            id,
            payload: {
              record
            }
          } as RecordUpdatedAction)
        ));
      })
    ))
  )
}
