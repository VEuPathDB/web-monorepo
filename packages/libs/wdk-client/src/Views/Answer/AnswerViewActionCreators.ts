import { ActionThunk } from '../../Utils/ActionCreatorUtils';
import {pick} from 'lodash';
import {AttributeField, RecordClass, Question, Answer, TableField} from '../../Utils/WdkModel'

export type DisplayInfo = {
  customName: string;
  pagination: { offset: number, numRecords: number};
  attributes?: string[] | '__ALL_ATTRIBUTES__';
  tables?: string[] | '__ALL_TABLES__';
  sorting: Sorting[];
}

export type Parameters = {
  [key: string]: string;
}

export type Sorting = {
  attributeName: string
  direction: 'ASC' | 'DESC'
}

export type AnswerOptions = {
  parameters?: Parameters;
  filters?: {name: string, value: any}[]
  viewFilters?: {name: string, value: any[]}
  displayInfo: DisplayInfo
}

// Action types
export type LoadingAction = {
  type: 'answer/loading'
}
export type ErrorAction = {
  type: 'answer/error',
  payload: {
    error: Error
  }
}
export type AddedAction = {
  type: 'answer/added',
  payload: {
    answer: Answer,
    question: Question,
    recordClass: RecordClass,
    displayInfo: DisplayInfo,
    parameters: Parameters,
  }
}
export type TableSortedAction = {
  type: 'answer/sorting-updated',
  payload: {
    sorting: Sorting[]
  }
}
export type ColumnMovedAction = {
  type: 'answer/column-moved',
  payload: {
    columnName: string,
    newPosition: number
  }
}
export type AttributesChangedAction = {
  type: 'answer/attributes-changed',
  payload: {
    attributes: AttributeField[]
  }
}
export type TableFilteredAction = {
  type: 'answer/filtered',
  payload: {
    terms: string,
    attributes: string[],
    tables: string[]
  }
}

let hasUrlSegment = (urlSegment: string) => (e: RecordClass | Question) =>
  e.urlSegment === urlSegment

/**
 * Retrieve's an Answer resource from the WDK REST Service and dispatches an
 * action with the resource. This uses the restAction helper function
 * (see ../filters/restFilter).
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
): ActionThunk<LoadingAction | ErrorAction | AddedAction> {
  return function run({ wdkService }) {
    let { parameters = {} as Parameters, filters = [], displayInfo } = opts;

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
      let formatting = {
        format: 'wdk-service-json',
        formatConfig: pick(displayInfo, ['attributes', 'pagination', 'sorting'])
      };
      return wdkService.getAnswer(answerSpec, formatting);
    });

    return [
      { type: 'answer/loading' },
      Promise.all([answerPromise, questionPromise, recordClassPromise])
      .then(
        ([answer, question, recordClass]) => ({
          type: 'answer/added',
          payload: {
            answer,
            question,
            recordClass,
            displayInfo,
            parameters
          }
        } as AddedAction),
        error => ({
          type: 'answer/error',
          payload: { error }
        } as ErrorAction)
      )
    ];
  }
}

/**
 * Sort the current answer in `state` with the provided `attribute` and `direction`.
 *
 * @param {Object} state AnswerViewStore state
 * @param {Object} attribute Record attribute field
 * @param {string} direction Can be 'ASC' or 'DESC'
 */
export function sort(sorting: Sorting[]): TableSortedAction {
  return {
    type: 'answer/sorting-updated',
    payload: { sorting }
  };
}

/**
 * Change the position of a column in the answer table.
 *
 * @param {string} columnName The name of the attribute to move.
 * @param {number} newPosition The new 0-based index position of the attribute.
 */
export function moveColumn(columnName: string, newPosition: number): ColumnMovedAction {
  return {
    type: 'answer/column-moved',
    payload: { columnName, newPosition }
  };
}

/**
 * Update the set of visible attributes in the answer table.
 *
 * @param {Array<Object>} attributes The new set of attributes to show in the table.
 */
export function changeAttributes(attributes: AttributeField[]): AttributesChangedAction {
  return {
    type: 'answer/attributes-changed',
    payload: { attributes }
  };
}

/**
 * Set the filter for the answer table.
 *
 * FIXME use a service object to filter the answer.
 *
 * @param {Object} spec The filter specification.
 * @param {string} spec.terms The string to parse and filter.
 * @param {Array<string>} spec.attributes The set of attribute names whose values should be queried.
 * @param {Array<string>} spec.tables The set of table names whose values should be queried.
 */
export function updateFilter(terms: string, attributes: string[], tables: string[]): TableFilteredAction {
  return {
    type: 'answer/filtered',
    payload: { terms, attributes, tables }
  };
}
