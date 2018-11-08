import { pick } from 'lodash';
import { ActionThunk } from 'wdk-client/Utils/ActionCreatorUtils';
import {
  AttributeField,
  RecordClass,
  Question,
  Answer,
  ParameterValues
} from "wdk-client/Utils/WdkModel";


// Shared types
// ------------

export type DisplayInfo = {
  customName: string;
  pagination: { offset: number, numRecords: number};
  attributes?: string[] | '__ALL_ATTRIBUTES__';
  tables?: string[] | '__ALL_TABLES__';
  sorting: Sorting[];
}

export type Sorting = {
  attributeName: string
  direction: 'ASC' | 'DESC'
}

export type AnswerOptions = {
  parameters?: ParameterValues;
  filters?: {name: string, value: any}[]
  viewFilters?: {name: string, value: any[]}
  displayInfo: DisplayInfo
}


// Actions
// -------

export type Action =
  | ChangeColumnPositionAction
  | ChangeFilterAction
  | ChangeSortingAction
  | ChangeVisibleColumnsAction
  | EndLoadingWithAnswerAction
  | EndLoadingWithErrorAction
  | StartLoadingAction

//==============================================================================

export const START_LOADING = 'answer/start-loading';

export interface StartLoadingAction {
  type: typeof START_LOADING;
}

export function startLoading(): StartLoadingAction {
  return { type: START_LOADING }
}

//==============================================================================

export const END_LOADING_WITH_ERROR = 'answer/end-loading-with-error';

export interface EndLoadingWithErrorAction {
  type: typeof END_LOADING_WITH_ERROR;
  payload: {
    error: Error;
  }
}

export function endLoadingWithError(error: Error): EndLoadingWithErrorAction {
  return {
    type: END_LOADING_WITH_ERROR,
    payload: { error }
  }
}

//==============================================================================

export const END_LOADING_WITH_ANSWER = 'answer/end-loading-with-answer';

interface AnswerData {
  answer: Answer,
  question: Question,
  recordClass: RecordClass,
  displayInfo: DisplayInfo,
  parameters: ParameterValues,
}

export interface EndLoadingWithAnswerAction {
  type: typeof END_LOADING_WITH_ANSWER;
  payload: AnswerData
}

export function endLoadingWithAnswer(payload: AnswerData): EndLoadingWithAnswerAction {
  return {
    type: END_LOADING_WITH_ANSWER,
    payload
  }
}

//==============================================================================

export const CHANGE_SORTING = 'answer/change-sorting';

export interface ChangeSortingAction {
  type: typeof CHANGE_SORTING;
  payload: {
    sorting: Sorting[];
  }
}

export function changeSorting(sorting: Sorting[]): ChangeSortingAction {
  return {
    type: CHANGE_SORTING,
    payload: { sorting }
  }
}

//==============================================================================

export const CHANGE_COLUMN_POSITION = 'answer/change-column-position';

export interface ChangeColumnPositionAction {
  type: typeof CHANGE_COLUMN_POSITION;
  payload: {
    columnName: string;
    newPosition: number;
  }
}

export function changeColumnPosition(columnName: string, newPosition: number): ChangeColumnPositionAction {
  return {
    type: CHANGE_COLUMN_POSITION,
    payload: {
      columnName,
      newPosition
    }
  }
}

//==============================================================================

export const CHANGE_VISIBLE_COLUMNS = 'answer/change-visible-columns';

export interface ChangeVisibleColumnsAction {
  type: typeof CHANGE_VISIBLE_COLUMNS;
  payload: {
    attributes: AttributeField[];
  }
}

export function changeVisibleColumns(attributes: AttributeField[]): ChangeVisibleColumnsAction {
  return {
    type: CHANGE_VISIBLE_COLUMNS,
    payload: { attributes }
  }
}

//==============================================================================

export const CHANGE_FILTER = 'answer/change-filter';

export interface ChangeFilterAction {
  type: typeof CHANGE_FILTER;
  payload: {
    terms: string;
    attributes: string[];
    tables: string[];
  };
}

export function changeFilter(terms: string, attributes: string[], tables: string[]): ChangeFilterAction {
  return {
    type: CHANGE_FILTER,
    payload: { terms, attributes, tables }
  }
}

//==============================================================================


// Thunks
// ------

type LoadAction =
  | StartLoadingAction
  | EndLoadingWithErrorAction
  | EndLoadingWithAnswerAction

/**
 * Retrieve's an Answer resource from the WDK REST Service and dispatches an
 * action with the resource.
 *
 * Request data format, POSTed to service:
 *
 *     {
 *       "answerSpec": {
 *         "questionName": String,
 *         "parameters": Object (map of paramName -> paramValue),
 *         "filters": [ {
 *           “name": String, value: Any
 *         } ],
 *         "viewFilters": [ {
 *           “name": String, value: Any
 *         } ]
 *       },
 *       formatting: {
 *         formatConfig: {
 *           pagination: { offset: Number, numRecords: Number },
 *           attributes: [ attributeName: String ],
 *           sorting: [ { attributeName: String, direction: Enum[ASC,DESC] } ]
 *         }
 *       }
 *     }
 *
 * @param {string} questionUrlSegment
 * @param {Object} opts Addition data to include in request.
 * @param {Object} opts.parameters Object map of parameters.
 * @param {Array<Object>} opts.filters Array of filter spec objects: { name: string; value: any }
 * @param {Array<Object>} opts.viewFilters Array of view filter  spec objects: { name: string; value: any }
 * @param {string} opts.displayInfo.customName Custom name for the question to display on the page
 * @param {Object} opts.displayInfo.pagination Pagination specification.
 * @param {number} opts.displayInfo.pagination.offset 0-based index for first record.
 * @param {number} opts.displayInfo.pagination.numRecord The number of records to include.
 * @param {Array<string>} opts.displayInfo.attributes Array of attribute names to include.
 * @param {Array<Object>} opts.displayInfo.sorting Array of sorting spec objects: { attributeName: string; direction: "ASC" | "DESC" }
 */
export function loadAnswer(
  questionUrlSegment: string,
  recordClassUrlSegment: string,
  opts: AnswerOptions
): ActionThunk<LoadAction> {
  return function run({ wdkService }) {
    let { parameters = {} as ParameterValues, filters = [], displayInfo } = opts;

    // FIXME Set attributes to whatever we're sorting on. This is required by
    // the service, but it doesn't appear to have any effect at this time. We
    // should be passing the attribute in based on info from the RecordClass.
    displayInfo.attributes = "__ALL_ATTRIBUTES__"; // special string for default attributes
    displayInfo.tables = [];

    let questionPromise = wdkService.findQuestion(hasUrlSegment(questionUrlSegment));
    let recordClassPromise = wdkService.findRecordClass(hasUrlSegment(recordClassUrlSegment));
    let answerPromise = questionPromise.then(question => {

      if (question == null)
        throw new Error("Could not find a question identified by `" + questionUrlSegment + "`.");

      // Build XHR request data for '/answer'
      let answerSpec = {
        questionName: question.name,
        parameters,
        filters
      };
      let formatConfig = pick(displayInfo, ['attributes', 'pagination', 'sorting']);
      return wdkService.getAnswerJson(answerSpec, formatConfig);
    });

    return [
      startLoading(),
      Promise.all([answerPromise, questionPromise, recordClassPromise])
      .then(
        ([answer, question, recordClass]) => endLoadingWithAnswer({
          answer,
          question,
          recordClass,
          displayInfo,
          parameters
        }),
        error => endLoadingWithError(error)
      )
    ];
  }
}

// Helpers
// -------

const hasUrlSegment = (urlSegment: string) => (e: RecordClass | Question): boolean =>
  e.urlSegment === urlSegment