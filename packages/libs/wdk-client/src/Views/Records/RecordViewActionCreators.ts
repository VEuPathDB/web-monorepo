import { uniqueId } from 'lodash';

import {
  BasketStatusErrorAction,
  BasketStatusLoadingAction,
  BasketStatusReceivedAction,
  FavoritesStatusErrorAction,
  FavoritesStatusLoadingAction,
  FavoritesStatusReceivedAction,
  loadBasketStatus,
  loadFavoritesStatus,
} from 'wdk-client/Views/User/UserActionCreators';
import { Action, ActionThunk, EmptyAction, emptyAction } from 'wdk-client/Utils/ActionCreatorUtils';
import { CategoryTreeNode } from 'wdk-client/Utils/CategoryUtils';
import { getTree } from 'wdk-client/Utils/OntologyUtils';
import { RecordClass, RecordInstance } from 'wdk-client/Utils/WdkModel';
import WdkService, { ServiceError } from 'wdk-client/Utils/WdkService';

import { isLeafFor, isNotInternalNode } from 'wdk-client/Views/Records/RecordUtils';

type BasketAction = BasketStatusLoadingAction | BasketStatusErrorAction | BasketStatusReceivedAction;
type FavoriteAction = FavoritesStatusLoadingAction | FavoritesStatusReceivedAction | FavoritesStatusErrorAction;

export type RecordReceivedAction = {
  type: 'record-view/active-record-received',
  id: string,
  payload: {
    record: RecordInstance,
    recordClass: RecordClass,
    categoryTree: CategoryTreeNode
  },
}

export type RecordUpdatedAction = {
  type: 'record-view/active-record-updated',
  id: string,
  payload: {
    record: RecordInstance
  },
}

export type RecordLoadingAction = {
  type: 'record-view/active-record-loading',
  id: string,
  payload: {
    recordClassName: string,
    primaryKeyValues: string[]
  },
}

export type RecordErrorAction = {
  type: 'record-view/error-received',
  id: string
  payload: { error: ServiceError },
}

export type SectionVisibilityAction = {
  type: 'record-view/section-visibility-changed',
  payload: {
    name: string,
    isVisible: boolean
  }
}

export type AllFieldVisibilityAction = {
  type: 'record-view/all-field-visibility-changed',
  payload: {
    isVisible: boolean
  }
}

export type NavigationVisibilityAction = {
  type: 'record-view/navigation-visibility-changed',
  payload: {
    isVisible: boolean
  }
}

export type CategoryExpansionAction = {
  type: 'record-view/navigation-category-expansion-changed',
  payload: {
    expandedCategories: string[]
  }
}

export type NavigationQueryAction = {
  type: 'record-view/navigation-query-changed',
  payload: {
    query: string
  }
}

type LoadRecordAction = RecordLoadingAction
  | RecordErrorAction
  | RecordReceivedAction
  | RecordUpdatedAction

type UserAction = BasketAction | FavoriteAction

export interface RecordRequestOptions {
  attributes: string[];
  tables: string[];
}

interface RequestRequestOptionsGetter {
  (recordClass: RecordClass, categoryTree: CategoryTreeNode): RecordRequestOptions[]
}


/** Fetch page data from services */
export function loadRecordData(
  recordClass: string,
  primaryKeyValues: string[],
  getRecordRequestOptions: RequestRequestOptionsGetter
): ActionThunk<LoadRecordAction | UserAction | EmptyAction> {
  return function run({ wdkService }) {
    return setActiveRecord(recordClass, primaryKeyValues, getRecordRequestOptions);
  };
}

const makeWithId = <T extends Action & { id: string }>(
  id = uniqueId('groupid')
) => (action: Action) => {
  return Object.assign(action, { id }) as T;
}

/**
 * Fetches the new record from the service and dispatches related
 * actions so that the store can update.
 *
 * @param {string} recordClassName
 * @param {Array<string>} primaryKeyValues
 */
function setActiveRecord(
  recordClassName: string,
  primaryKeyValues: string[],
  getRecordRequestOptions: RequestRequestOptionsGetter
): ActionThunk<LoadRecordAction|UserAction|EmptyAction> {
  return ({ wdkService }) => {
    const withId = makeWithId<LoadRecordAction>();
    // Helper to handle errors
    const makeErrorAction = (error: Error) => withId({
      type: 'record-view/error-received',
      payload: { error }
    });

    return [
      withId({
        type: 'record-view/active-record-loading',
        payload: { recordClassName, primaryKeyValues }
      }),
      // Fetch the record base and tables in parallel.
      Promise.all([
        wdkService.findRecordClass(r => r.urlSegment === recordClassName),
        getPrimaryKey(wdkService, recordClassName, primaryKeyValues),
        getCategoryTree(wdkService, recordClassName)
      ]).then(
        ([recordClass, primaryKey, fullCategoryTree]) => {
          const [ initialOptions, ...additionalOptions ] =
            getRecordRequestOptions(recordClass, fullCategoryTree);
          const categoryTree = getTree({ name: '__', tree: fullCategoryTree }, isNotInternalNode);
          const initialAction$ = wdkService.getRecord(recordClass.name, primaryKey, initialOptions).then(
            record => ({
              type: 'record-view/active-record-received',
              payload: { record, recordClass, categoryTree }
            } as RecordReceivedAction)
          );
          const additionalActions = additionalOptions.map(options =>
            wdkService.getRecord(recordClass.name, primaryKey, options).then(
              record => ({
                type: 'record-view/active-record-updated',
                payload: { record }
              } as RecordUpdatedAction)
            )
          );

          return initialAction$.then(
            action => [
              withId(action),
              additionalActions.map(action$ => action$.then(withId, makeErrorAction)),
              recordClass.useBasket ? loadBasketStatus(action.payload.record) : emptyAction,
              loadFavoritesStatus(action.payload.record)
            ],
            makeErrorAction
          );
        },
        makeErrorAction
      )
    ];
  }
}

/** Update a section's collapsed status */
export function updateSectionVisibility(sectionName: string, isVisible: boolean): SectionVisibilityAction {
  return {
    type: 'record-view/section-visibility-changed',
    payload: { name: sectionName, isVisible }
  };
}

/** Change the visibility for all record fields (attributes and tables) */
export function updateAllFieldVisibility(isVisible: boolean): AllFieldVisibilityAction {
  return {
    type: 'record-view/all-field-visibility-changed',
    payload: { isVisible }
  }
}

/** Update navigation section search term */
export function updateNavigationQuery(query: string): NavigationQueryAction {
  return {
    type: 'record-view/navigation-query-changed',
    payload: { query }
  };
}

/** Change the visibility of the navigation panel */
export function updateNavigationVisibility(isVisible: boolean): NavigationVisibilityAction {
  return {
    type: 'record-view/navigation-visibility-changed',
    payload: { isVisible }
  }
}

/** Change the visibility of subcategories in the navigation section */
export function updateNavigationCategoryExpansion(expandedCategories: string[]): CategoryExpansionAction {
  return {
    type: 'record-view/navigation-category-expansion-changed',
    payload: { expandedCategories }
  }
}

// helpers
// -------

/**
 * Get the base record request payload object
 * @param wdkService
 * @param recordClassUrlSegment
 * @param primaryKeyValues
 * @returns Promise<PrimaryKey>
 */
function getPrimaryKey(wdkService: WdkService, recordClassUrlSegment: string, primaryKeyValues: string[]) {
  return wdkService.findRecordClass(r => r.urlSegment === recordClassUrlSegment)
    .then(recordClass => {
      if (recordClass == null)
        throw new Error("Could not find a record class identified by `" + recordClassUrlSegment + "`.");

      return recordClass.primaryKeyColumnRefs
        .map((ref, index) => ({ name: ref, value: primaryKeyValues[index] }));
    })
}

/** Get the category tree for the given record class */
function getCategoryTree(wdkService: WdkService, recordClassUrlSegment: string) {
  return Promise.all([
    wdkService.getOntology(),
    wdkService.findRecordClass(r => r.urlSegment === recordClassUrlSegment)
  ]).then(([ontology, recordClass]) => {
    return getTree(ontology, isLeafFor(recordClass.name));
  });
}