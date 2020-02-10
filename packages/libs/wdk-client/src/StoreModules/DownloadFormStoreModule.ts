import {
  SET_ERROR,
  INITIALIZE,
  START_LOADING,
  SELECT_REPORTER,
  UPDATE_FORM_UI,
  UPDATE_FORM,
  ReporterSelection
} from 'wdk-client/Actions/DownloadFormActions';
import WdkServiceJsonReporterForm from 'wdk-client/Views/ReporterForm/WdkServiceJsonReporterForm';
import {UserPreferences} from 'wdk-client/Utils/WdkUser';
import {RecordClass, Question, Reporter} from 'wdk-client/Utils/WdkModel';
import { ServiceError } from 'wdk-client/Service/ServiceError';
import { CategoryOntology } from 'wdk-client/Utils/CategoryUtils';
import { Action } from 'wdk-client/Actions';
import {ResultType} from 'wdk-client/Utils/WdkResult';
export const key = 'downloadForm';

export type State = {
  preferences: UserPreferences | null,
  ontology: CategoryOntology | null,
  resultType: ResultType | null,
  question: Question | null,
  recordClass: RecordClass | null,
  scope: string | null,
  availableReporters: Reporter[],
  isLoading: boolean | null,
  selectedReporter: string | null,
  formState: any,
  formUiState: any,
  error?: ServiceError
}


type GetSelectedReporter = (selectedReporterName: string | undefined, recordClassName: string) => SelectedReporter;

export type SelectedReporter = {
  getInitialState(state: State): any
}

const initialState: State = {
  // 'static' data that should not change for the life of the page
  preferences: null,
  ontology: null,
  resultType: null,
  question: null,
  recordClass: null,
  scope: null,
  availableReporters: [],

  // 'dynamic' data that is updated with user actions
  isLoading: false,
  selectedReporter: null,
  formState: null,
  formUiState: null
}

const getDefaultReporter: GetSelectedReporter = () => WdkServiceJsonReporterForm;

export const makeReducer = (getSelectedReporter: GetSelectedReporter = getDefaultReporter) => (state: State = initialState, action: Action): State => {
  switch(action.type) {

    case START_LOADING:
      return setFormLoading(state, true);

    case INITIALIZE:
      return initialize(getSelectedReporter, state, action.payload);

    case SELECT_REPORTER:
      return updateReporter(getSelectedReporter, state, action.payload.selectedReporter);

    case UPDATE_FORM:
      return updateFormState(state, action.payload.formState);

    case UPDATE_FORM_UI:
      return updateFormUiState(state, action.payload.formUiState);

    case SET_ERROR:
      return setError(state, action.payload.error);

    default:
      return state;
  }
}

export const reduce = makeReducer();


function setFormLoading(state: State, isLoading: boolean) {
  return Object.assign({}, state, { isLoading });
}

function setError(state: State, error: Error) {
  return Object.assign({}, state, { error });
}

interface InitializeData {
  resultType: ResultType,
  question: Question,
  recordClass: RecordClass,
  scope: string,
  preferences: UserPreferences,
  ontology: CategoryOntology
};


function initialize(
  getSelectedReporter: GetSelectedReporter,
  state: State,
  { resultType, question, recordClass, scope, preferences, ontology }: InitializeData
) {

  // only use reporters configured for the report download page
  let availableReporters = recordClass.formats.filter(reporter => reporter.scopes.indexOf(scope) > -1);

  // set portion of static page state not loaded automatically
  let partialState = Object.assign({}, state, { resultType, question, recordClass, scope, availableReporters, preferences, ontology });

  return tryFormInit(getSelectedReporter, partialState);
}

function tryFormInit(getSelectedReporter: GetSelectedReporter, state: State) {
  // try to calculate form state for WDK JSON reporter
  if (state.preferences != null && state.ontology != null && state.resultType != null && state.recordClass != null) {
    // step, preferences, and ontology have been loaded;
    //    calculate state and set isLoading to false
    let selectedReporterName = (state.availableReporters.length == 1 ?
        state.availableReporters[0].name : undefined);
    return Object.assign({}, state, {
      isLoading: false,
      selectedReporter: selectedReporterName
    },
    getSelectedReporter(selectedReporterName, state.recordClass.fullName).getInitialState(state));
  }

  // one of the initialize actions has not yet been sent
  return state;
}

function updateReporter(getSelectedReporter: GetSelectedReporter, state: State, selectedReporter?: ReporterSelection) {
  // selectedReporter may be undefined or invalid since we are now respecting a query param "preference"
  let selectedReporterName: string | undefined = undefined;
  if (typeof selectedReporter === 'number') {
    // make sure valid index was passed
    if (selectedReporter < 0 || selectedReporter >= state.availableReporters.length) {
      throw new Error("Requested reporter index " + selectedReporter + " is out of bounds.");
    }
    selectedReporterName = state.availableReporters[selectedReporter].name;
  }
  else {
    // make sure valid name was passed
    if (state.availableReporters.findIndex(r => r.name === selectedReporter) != -1) {
      selectedReporterName = selectedReporter;
    }
  }
  return !selectedReporterName || state.recordClass == null ? state :
    Object.assign({}, state, { selectedReporter: selectedReporterName },
      getSelectedReporter(selectedReporterName, state.recordClass.fullName).getInitialState(state));
}

function updateFormState(state: State, formState: any) {
  return Object.assign({}, state, { formState });
}

function updateFormUiState(state: State, formUiState: any) {
  return Object.assign({}, state, { formUiState });
}
