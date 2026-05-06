import { pick } from 'lodash';
import { ActionThunk } from '../Core/WdkMiddleware';
import {
  AttributeField,
  RecordClass,
  Question,
  Answer,
  ParameterValues,
  AnswerSpec,
} from '../Utils/WdkModel';
import { preorderSeq } from '../Utils/TreeUtils';
import { isQualifying, getId } from '../Utils/CategoryUtils';

// Shared types
// ------------

export type DisplayInfo = {
  customName: string;
  pagination: { offset: number; numRecords: number };
  attributes: string[];
  tables: string[];
  sorting: Sorting[];
};

export type Sorting = {
  attributeName: string;
  direction: 'ASC' | 'DESC';
};

export type AnswerOptions = {
  parameters?: ParameterValues;
  displayInfo: DisplayInfo;
};

// Actions
// -------

export type Action =
  | ChangeColumnPositionAction
  | ChangeSortingAction
  | ChangeVisibleColumnsAction
  | EndLoadingWithAnswerAction
  | EndLoadingWithErrorAction
  | StartLoadingAction;

//==============================================================================

export const START_LOADING = 'answer/start-loading';

export interface StartLoadingAction {
  type: typeof START_LOADING;
}

export function startLoading(): StartLoadingAction {
  return { type: START_LOADING };
}

//==============================================================================

export const END_LOADING_WITH_ERROR = 'answer/end-loading-with-error';

export interface EndLoadingWithErrorAction {
  type: typeof END_LOADING_WITH_ERROR;
  payload: {
    error: Error;
  };
}

export function endLoadingWithError(error: Error): EndLoadingWithErrorAction {
  return {
    type: END_LOADING_WITH_ERROR,
    payload: { error },
  };
}

//==============================================================================

export const END_LOADING_WITH_ANSWER = 'answer/end-loading-with-answer';

interface AnswerData {
  answer: Answer;
  question: Question;
  recordClass: RecordClass;
  displayInfo: DisplayInfo;
  parameters: ParameterValues;
}

export interface EndLoadingWithAnswerAction {
  type: typeof END_LOADING_WITH_ANSWER;
  payload: AnswerData;
}

export function endLoadingWithAnswer(
  payload: AnswerData
): EndLoadingWithAnswerAction {
  return {
    type: END_LOADING_WITH_ANSWER,
    payload,
  };
}

//==============================================================================

export const CHANGE_SORTING = 'answer/change-sorting';

export interface ChangeSortingAction {
  type: typeof CHANGE_SORTING;
  payload: {
    sorting: Sorting[];
  };
}

export function changeSorting(sorting: Sorting[]): ChangeSortingAction {
  return {
    type: CHANGE_SORTING,
    payload: { sorting },
  };
}

//==============================================================================

export const CHANGE_COLUMN_POSITION = 'answer/change-column-position';

export interface ChangeColumnPositionAction {
  type: typeof CHANGE_COLUMN_POSITION;
  payload: {
    columnName: string;
    newPosition: number;
  };
}

export function changeColumnPosition(
  columnName: string,
  newPosition: number
): ChangeColumnPositionAction {
  return {
    type: CHANGE_COLUMN_POSITION,
    payload: {
      columnName,
      newPosition,
    },
  };
}

//==============================================================================

export const CHANGE_VISIBLE_COLUMNS = 'answer/change-visible-columns';

export interface ChangeVisibleColumnsAction {
  type: typeof CHANGE_VISIBLE_COLUMNS;
  payload: {
    attributes: AttributeField[];
  };
}

export function changeVisibleColumns(
  attributes: AttributeField[]
): ChangeVisibleColumnsAction {
  return {
    type: CHANGE_VISIBLE_COLUMNS,
    payload: { attributes },
  };
}

//==============================================================================

// Thunks
// ------

type LoadAction =
  | StartLoadingAction
  | EndLoadingWithErrorAction
  | EndLoadingWithAnswerAction;

/**
 * Retrieve's an Answer resource from the WDK REST Service and dispatches an
 * action with the resource.
 *
 * Request data format, POSTed to service:
 *
 *     {
 *       "searchConfig": {
 *         "parameters": Object (map of paramName -> paramValue),
 *         "filters": [ {
 *           “name": String, value: Any
 *         } ],
 *         "viewFilters": [ {
 *           “name": String, value: Any
 *         } ]
 *       },
 *       reporterConfig: {
 *         pagination: { offset: Number, numRecords: Number },
 *         attributes: [ attributeName: String ],
 *         sorting: [ { attributeName: String, direction: Enum[ASC,DESC] } ]
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
    return [
      startLoading(),
      async () => {
        try {
          const { parameters = {}, displayInfo } = opts;
          const question = await wdkService.findQuestion(questionUrlSegment);
          const recordClass = await wdkService.findRecordClass(
            recordClassUrlSegment
          );
          const ontology = await wdkService.getCategoriesOntology();
          const attributes = preorderSeq(ontology.tree)
            .filter(
              isQualifying({
                scope: 'results',
                targetType: 'attribute',
                recordClassName: recordClass.fullName,
              })
            )
            .map(getId)
            .toArray();
          const tables = preorderSeq(ontology.tree)
            .filter(
              isQualifying({
                scope: 'results',
                targetType: 'table',
                recordClassName: recordClass.fullName,
              })
            )
            .map(getId)
            .toArray();

          displayInfo.attributes = attributes;
          displayInfo.tables = tables;

          // Build XHR request data for '/answer'
          const answerSpec: AnswerSpec = {
            searchName: question.urlSegment,
            searchConfig: {
              parameters,
            },
          };
          const formatConfig = pick(displayInfo, [
            'attributes',
            'tables',
            'pagination',
            'sorting',
          ]);
          const answer = await wdkService.getAnswerJson(
            answerSpec,
            formatConfig
          );

          return endLoadingWithAnswer({
            answer,
            question,
            recordClass,
            displayInfo,
            parameters,
          });
        } catch (error) {
          return endLoadingWithError(error);
        }
      },
    ];
  };
}
