import {
  Answer,
  AttributeField,
  Question,
  RecordClass,
  RecordInstance,
} from '../Utils/WdkModel';
import { ServiceError } from '../Service/ServiceError';
import { Action } from '../Actions';
import {
  START_LOADING,
  END_LOADING_WITH_ANSWER,
  END_LOADING_WITH_ERROR,
  CHANGE_COLUMN_POSITION,
  CHANGE_SORTING,
  CHANGE_VISIBLE_COLUMNS,
  EndLoadingWithAnswerAction,
  ChangeColumnPositionAction,
  ChangeVisibleColumnsAction,
  ChangeSortingAction,
  AnswerOptions,
} from '../Actions/AnswerActions';

type EndLoadingWithAnswerPayload = EndLoadingWithAnswerAction['payload'];
type ChangeColumnPositionPayload = ChangeColumnPositionAction['payload'];
type ChangeVisibleColumnsPayload = ChangeVisibleColumnsAction['payload'];
type ChangeSortingPayload = ChangeSortingAction['payload'];

export const key = 'answerView';

export type FilterState = {
  filterTerm: string;
  filterAttributes: string[];
  filterTables: string[];
};

export type State = Partial<
  Answer &
    AnswerOptions &
    FilterState & {
      question: Question;
      recordClass: RecordClass;
      allAttributes: AttributeField[];
      visibleAttributes: AttributeField[];
      unfilteredRecords: RecordInstance[];
      isLoading: boolean;
      error?: Error | ServiceError;
    }
>;

const initialState = {};

export function reduce(state: State = initialState, action: Action): State {
  switch (action.type) {
    case START_LOADING:
      return { ...state, isLoading: true, error: undefined };
    case END_LOADING_WITH_ERROR:
      return { ...action.payload, isLoading: false };
    case END_LOADING_WITH_ANSWER:
      return addAnswer(state, action.payload);
    case CHANGE_VISIBLE_COLUMNS:
      return updateVisibleAttributes(state, action.payload);
    case CHANGE_SORTING:
      return updateSorting(state, action.payload);
    case CHANGE_COLUMN_POSITION:
      return moveTableColumn(state, action.payload);
    default:
      return state;
  }
}

function addAnswer(state: State, payload: EndLoadingWithAnswerPayload) {
  let { answer, displayInfo, question, recordClass, parameters } = payload;

  // need to filter wdk_weight from multiple places;
  let isNotWeight = (attr: string | AttributeField) =>
    typeof attr === 'string' ? attr != 'wdk_weight' : attr.name != 'wdk_weight';

  // collect attributes from recordClass and question
  let allAttributes = recordClass.attributes
    .filter((attr) => displayInfo.attributes.includes(attr.name))
    .concat(question.dynamicAttributes)
    .filter(isNotWeight);

  // use previously selected visible attributes unless they don't exist or the question changed
  let visibleAttributes = state.visibleAttributes;
  if (
    !visibleAttributes ||
    (state.meta && state.question?.urlSegment !== question.urlSegment)
  ) {
    // need to populate attribute details for visible attributes
    visibleAttributes = question.defaultAttributes
      .map((attrName) => allAttributes.find((attr) => attr.name === attrName))
      .filter((attr): attr is AttributeField => attr != null);
  }

  // Remove search weight from answer meta since it doens't apply to non-Step answers
  answer.meta.attributes = answer.meta.attributes.filter(isNotWeight);

  /*
   * This will update the keys `filteredRecords`, and `answerSpec` in `state`.
   */
  return Object.assign({}, state, {
    meta: answer.meta,
    records: answer.records,
    question,
    recordClass,
    parameters,
    allAttributes,
    visibleAttributes,
    unfilteredRecords: answer.records,
    isLoading: false,
    displayInfo,
  });
}

/**
 * Update the position of an attribute in the answer table.
 *
 * @param {string} columnName The name of the attribute being moved.
 * @param {number} newPosition The 0-based index to move the attribute to.
 */
function moveTableColumn(
  state: State,
  { columnName, newPosition }: ChangeColumnPositionPayload
) {
  /* make a copy of list of attributes we will be altering */
  let attributes = [...(state.visibleAttributes || [])];

  /* The current position of the attribute being moved */
  let currentPosition = attributes.findIndex(function (attribute) {
    return attribute.name === columnName;
  });

  /* The attribute being moved */
  let attribute = attributes[currentPosition];

  // remove attribute from array
  attributes.splice(currentPosition, 1);

  // then, insert into new position
  attributes.splice(newPosition, 0, attribute);

  return Object.assign({}, state, { visibleAttributes: attributes });
}

function updateVisibleAttributes(
  state: State,
  { attributes }: ChangeVisibleColumnsPayload
) {
  // Create a new copy of visibleAttributes
  let visibleAttributes = attributes.slice(0);

  // Create a new copy of state
  return Object.assign({}, state, { visibleAttributes });
}

function updateSorting(state: State, { sorting }: ChangeSortingPayload) {
  return Object.assign({}, state, {
    displayInfo: Object.assign({}, state.displayInfo, { sorting }),
  });
}
