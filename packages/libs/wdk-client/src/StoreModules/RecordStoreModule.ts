import { chunk, difference, get, union, uniq } from 'lodash';
import {
  ActionsObservable,
  combineEpics,
  StateObservable,
} from 'redux-observable';
import { EMPTY, Observable, from, merge, of } from 'rxjs';
import {
  bufferTime,
  filter,
  groupBy,
  map,
  mergeMap,
  switchMap,
} from 'rxjs/operators';
import { Action } from '../Actions';
import {
  ALL_FIELD_VISIBILITY,
  CATEGORY_EXPANSION,
  NAVIGATION_QUERY,
  NAVIGATION_VISIBILITY,
  RECORD_ERROR,
  RECORD_LOADING,
  RECORD_RECEIVED,
  RECORD_UPDATE,
  REQUEST_PARTIAL_RECORD,
  SECTION_VISIBILITY,
  SET_COLLAPSED_SECTIONS,
  TABLE_STATE_UPDATED,
  RequestPartialRecord,
  RecordReceivedAction,
  RecordUpdatedAction,
  getPrimaryKey,
  updateNavigationVisibility,
  setCollapsedSections,
  updateTableState,
} from '../Actions/RecordActions';
import {
  BASKET_STATUS_ERROR,
  BASKET_STATUS_LOADING,
  BASKET_STATUS_RECEIVED,
  FAVORITES_STATUS_ERROR,
  FAVORITES_STATUS_LOADING,
  FAVORITES_STATUS_RECEIVED,
} from '../Actions/UserActions';
import { RootState } from '../Core/State/Types';
import { EpicDependencies, ModuleEpic } from '../Core/Store';
import { getValue, preferences, setValue } from '../Preferences';
import { ServiceError } from '../Service/ServiceError';
import { CategoryTreeNode, getId, getTargetType } from '../Utils/CategoryUtils';
import { stateEffect } from '../Utils/ObserverUtils';
import { filterNodes } from '../Utils/TreeUtils';
import { RecordClass, RecordInstance } from '../Utils/WdkModel';

export const key = 'record';

export interface TableState {
  selectedRow?: number;
  searchTerm: string;
  expandedRows: number[];
}

export type State = {
  isLoading: boolean;
  record: RecordInstance;
  recordClass: RecordClass;
  categoryTree: CategoryTreeNode;
  requestId: string;
  error?: ServiceError;

  collapsedSections: string[];

  // keyed by table name
  tableStates: Record<string, TableState>;

  navigationVisible: boolean;
  navigationQuery: string;
  navigationCategoriesExpanded: string[];

  inBasket: boolean;
  loadingBasketStatus: boolean;
  basketError?: Error;

  favoriteId?: number;
  loadingFavoritesStatus: boolean;
  favoritesError?: Error;
};

/** Store for record page */
export function reduce(state: State = {} as State, action: Action): State {
  switch (action.type) {
    case RECORD_LOADING:
      return {
        ...state,
        isLoading: true,
        error: undefined,
        requestId: action.id,
      };

    case RECORD_RECEIVED: {
      if (action.id !== state.requestId) return state;
      let { record, recordClass, categoryTree } = action.payload;
      return {
        ...state,
        record,
        recordClass,
        collapsedSections: [],
        tableStates: {},
        navigationCategoriesExpanded: state.navigationCategoriesExpanded || [],
        isLoading: false,
        categoryTree,
      };
    }

    case TABLE_STATE_UPDATED: {
      return {
        ...state,
        tableStates: {
          ...state.tableStates,
          [action.payload.tableName]: action.payload.tableState,
        },
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
        error: action.payload.error,
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
          : union(state.collapsedSections, getAllFields(state)),
      };
    }

    case NAVIGATION_QUERY: {
      return {
        ...state,
        navigationQuery: action.payload.query,
      };
    }

    case NAVIGATION_VISIBILITY: {
      return {
        ...state,
        navigationVisible: action.payload.isVisible,
      };
    }

    case CATEGORY_EXPANSION:
      return {
        ...state,
        navigationCategoriesExpanded: action.payload.expandedCategories,
      };

    case BASKET_STATUS_LOADING:
      return action.payload.record.id === state.record.id
        ? {
            ...state,
            loadingBasketStatus: true,
          }
        : state;

    case BASKET_STATUS_RECEIVED:
      return action.payload.record.id === state.record.id
        ? {
            ...state,
            inBasket: action.payload.status,
            loadingBasketStatus: false,
          }
        : state;

    case BASKET_STATUS_ERROR:
      return action.payload.record.id === state.record.id
        ? {
            ...state,
            basketError: action.payload.error,
            loadingBasketStatus: false,
          }
        : state;

    case FAVORITES_STATUS_LOADING:
      return action.payload.record.id === state.record.id
        ? {
            ...state,
            loadingFavoritesStatus: true,
          }
        : state;

    case FAVORITES_STATUS_RECEIVED:
      return action.payload.record.id === state.record.id
        ? {
            ...state,
            favoriteId: action.payload.id,
            loadingFavoritesStatus: false,
          }
        : state;

    case FAVORITES_STATUS_ERROR:
      return action.payload.record.id === state.record.id
        ? {
            ...state,
            favoritesError: action.payload.error,
            loadingFavoritesStatus: false,
          }
        : state;

    default:
      return state;
  }
}

/** Create a new array adding or removing item */
function updateList<T>(item: T, add: boolean, list: T[] = []) {
  return add ? list.concat(item) : list.filter((x) => x !== item);
}

/** Get all attributes and tables of active record */
export function getAllFields(state: State) {
  return filterNodes<CategoryTreeNode>(isFieldNode, state.categoryTree).map(
    getId
  );
}

/** Test is node is a field node */
function isFieldNode(node: CategoryTreeNode) {
  let targetType = getTargetType(node);
  return targetType === 'attribute' || targetType === 'table';
}

type RecordOptions = {
  attributes: string[];
  tables: string[];
};

export const observe = combineEpics(observeRecordRequests, observeUserSettings);

interface StorageDescriptor {
  path: string;
  isRecordScoped: boolean;
  getValue?: (state: State) => unknown;
}

const storageItems: Record<string, StorageDescriptor> = {
  tables: {
    path: 'tableStates',
    isRecordScoped: true,
  },
  collapsedSections: {
    path: 'collapsedSections',
    isRecordScoped: false,
  },
  expandedSections: {
    path: 'expandedSections',
    getValue: (state) =>
      difference(getAllFields(state), state.collapsedSections),
    isRecordScoped: false,
  },
  navigationVisible: {
    path: 'navigationVisible',
    isRecordScoped: false,
  },
};

function observeRecordRequests(
  action$: ActionsObservable<Action>,
  state$: StateObservable<RootState>,
  deps: EpicDependencies
): Observable<Action> {
  return action$.pipe(
    filter(
      (action): action is RequestPartialRecord =>
        action.type === REQUEST_PARTIAL_RECORD
    ),
    groupBy((action) => action.id),
    mergeMap((group$) =>
      group$.pipe(
        bufferTime(100),
        mergeMap((actions) => chunk(actions, 10)),
        filter((actions) => actions.length > 0),
        mergeMap(async (actions) => {
          // build up request object
          // XXX Assuming recordClassName and primaryKey are the same for a given `id`
          const { id } = actions[0];
          const { recordClassName, primaryKeyValues } = actions[0].payload;
          const options = actions.reduce(
            (options, action) => {
              const { attributes = [], tables = [] } = action.payload;
              return Object.assign(options, {
                attributes: uniq([...options.attributes, ...attributes]),
                tables: uniq([...options.tables, ...tables]),
              });
            },
            { attributes: [], tables: [] } as RecordOptions
          );
          const primaryKey = await getPrimaryKey(
            deps.wdkService,
            recordClassName,
            primaryKeyValues
          );
          const record = await deps.wdkService.getRecord(
            recordClassName,
            primaryKey,
            options
          );
          return {
            type: RECORD_UPDATE,
            id,
            payload: {
              record,
            },
          } as RecordUpdatedAction;
        })
      )
    )
  );
}

/**
 * When record is loaded, read state from storage and emit actions to restore state.
 * When state is changed, write state to storage.
 */
function observeUserSettings(
  action$: ActionsObservable<Action>,
  state$: StateObservable<RootState>,
  deps: EpicDependencies
) {
  return action$.pipe(
    filter(
      (action): action is RecordReceivedAction =>
        action.type === RECORD_RECEIVED
    ),
    switchMap((action) => {
      let state = state$.value[key];
      let allFields = getAllFields(state);

      /** Show navigation for records with at least 5 categories */
      let navigationVisible = getStateFromStorage(
        storageItems.navigationVisible,
        state,
        state.categoryTree.children.length >= 5
      );

      /** merge stored visibleSections */
      let expandedSections = getStateFromStorage(
        storageItems.expandedSections,
        state,
        action.payload.defaultExpandedSections ?? allFields
      );

      let collapsedSections = expandedSections
        ? difference(allFields, expandedSections)
        : state.collapsedSections;

      let tableStates = getStateFromStorage(
        storageItems.tables,
        state,
        {}
      ) as Record<string, TableState>;

      return merge(
        from(
          Object.entries(tableStates).map(([tableName, tableState]) =>
            updateTableState(tableName, tableState)
          )
        ),
        of(
          updateNavigationVisibility(navigationVisible),
          setCollapsedSections(collapsedSections)
        ),
        action$.pipe(
          mergeMap((action) => {
            switch (action.type) {
              case SECTION_VISIBILITY:
              case ALL_FIELD_VISIBILITY:
                setStateInStorage(
                  storageItems.expandedSections,
                  state$.value[key]
                );
                break;
              case NAVIGATION_VISIBILITY:
                setStateInStorage(
                  storageItems.navigationVisible,
                  state$.value[key]
                );
                break;
              case TABLE_STATE_UPDATED:
                setStateInStorage(storageItems.tables, state$.value[key]);
                break;
            }
            return EMPTY;
          })
        )
      );
    })
  );
}

// Utility for making epics which...
// (1) On record load, update the "navigationVisible" state based on the "navigationVisible" preference
// (2) On change of "navigationVisible" state, update the "navigationVisible" preference
export function makeNavigationVisibilityPreferenceEpics(
  initialVisibility: (recordClass: RecordClass) => boolean
) {
  const observeNavigationVisibilityPreference: ModuleEpic<RootState, Action> = (
    action$,
    state$,
    deps
  ) =>
    action$.pipe(
      filter(
        (action): action is RecordReceivedAction =>
          action.type === RECORD_RECEIVED
      ),
      switchMap(() => {
        const recordClass = state$.value[key].recordClass;

        const navigationVisiblePreference$ = getValue(
          deps.wdkService,
          preferences.navigationVisible(recordClass.urlSegment)
        );

        return from(navigationVisiblePreference$).pipe(
          map((value) =>
            updateNavigationVisibility(value ?? initialVisibility(recordClass))
          )
        );
      })
    );

  const observeNavigationVisibilityState: ModuleEpic<RootState, Action> = (
    action$,
    state$,
    deps
  ) =>
    stateEffect(
      state$,
      (state) => state[key].navigationVisible,
      (newNavigationVisibility) => {
        const recordState = state$.value[key];
        const recordClassUrlSegment = recordState.recordClass.urlSegment;

        setValue(
          deps.wdkService,
          preferences.navigationVisible(recordClassUrlSegment),
          newNavigationVisibility
        );
      }
    );

  return {
    observeNavigationVisibilityPreference,
    observeNavigationVisibilityState,
  };
}

/** Read state property value from storage */
function getStateFromStorage(
  descriptor: StorageDescriptor,
  state: State,
  defaultValue: unknown
) {
  try {
    let key = getStorageKey(descriptor, state.record);
    return persistence.get(key, defaultValue);
  } catch (error) {
    console.error(
      'Warning: Could not retrieve %s from local storage.',
      descriptor.path,
      error
    );
    return defaultValue;
  }
}

/** Write state property value to storage */
function setStateInStorage(descriptor: StorageDescriptor, state: State) {
  try {
    let key = getStorageKey(descriptor, state.record);
    persistence.set(
      key,
      typeof descriptor.getValue === 'function'
        ? descriptor.getValue(state)
        : get(state, descriptor.path)
    );
  } catch (error) {
    console.error(
      'Warning: Could not set %s to local storage.',
      descriptor.path,
      error
    );
  }
}

/** Create storage key for property */
function getStorageKey(descriptor: StorageDescriptor, record: RecordInstance) {
  let { path, isRecordScoped } = descriptor;
  return (
    path +
    '/' +
    record.recordClassName +
    (isRecordScoped ? '/' + record.id.map((p) => p.value).join('/') : '')
  );
}

const persistence = (function makePersistenceModule() {
  const store = window.localStorage;
  const prefix = '@@ebrc@@';

  /**
   * Set the value for the key in the store
   */
  function set(key: string, value: unknown) {
    try {
      store.setItem(prefix + '/' + key, JSON.stringify(value));
    } catch (e) {
      console.error('Unable to set value to localStorage.', e);
    }
  }

  /**
   * Get the value for the key from the store
   */
  function get(key: string, defaultValue: unknown) {
    try {
      let item = store.getItem(prefix + '/' + key);
      return item == null ? defaultValue : JSON.parse(item);
    } catch (e) {
      console.error('Unable to get value from localStorage.', e);
      return defaultValue;
    }
  }

  return { get, set };
})();
