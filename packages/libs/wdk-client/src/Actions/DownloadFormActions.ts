import { getStepBundlePromise, getSingleRecordStepBundlePromise } from 'wdk-client/Utils/stepUtils';
import { ActionThunk, EmptyAction, emptyAction } from 'wdk-client/Core/WdkMiddleware';
import { Step, UserPreferences } from 'wdk-client/Utils/WdkUser';
import { Question, RecordClass } from 'wdk-client/Utils/WdkModel';
import { AnswerRequest } from 'wdk-client/Utils/WdkService';
import { CategoryOntology } from 'wdk-client/Utils/CategoryUtils';

export type Action =
  | InitializeAction
  | SelectReporterAction
  | SetErrorAction
  | StartLoadingAction
  | UpdateFormAction
  | UpdateFormUiAction

//==============================================================================

export const START_LOADING = 'downloadForm/start-loading';

export interface StartLoadingAction {
  type: typeof START_LOADING;
}

export function startLoading(): StartLoadingAction {
  return {
    type: START_LOADING
  };
}

//==============================================================================

export const INITIALIZE = 'downloadForm/initialize';

export interface InitializeAction {
  type: typeof INITIALIZE;
  payload: {
    step: Step,
    question: Question,
    recordClass: RecordClass,
    scope: string,
    preferences: UserPreferences,
    ontology: CategoryOntology
  };
}

export function initialize(data: InitializeAction['payload']): InitializeAction {
  return {
    type: INITIALIZE,
    payload: data
  };
}

//==============================================================================

export const SELECT_REPORTER = 'downloadForm/select-reporter';

export interface SelectReporterAction {
  type: typeof SELECT_REPORTER;
  payload: {
    selectedReporter: string;
  };
}

export function selectReporter(selectedReporter: string): SelectReporterAction {
  return {
    type: SELECT_REPORTER,
    payload: {
      selectedReporter
    }
  };
}

//==============================================================================

export const UPDATE_FORM = 'downloadForm/update-form';

export interface UpdateFormAction {
  type: typeof UPDATE_FORM;
  payload: {
    formState: any
  };
}

export function updateForm(formState: any): UpdateFormAction {
  return {
    type: UPDATE_FORM,
    payload: {
      formState
    }
  };
}

//==============================================================================

export const UPDATE_FORM_UI = 'downloadForm/update-form-ui';

export interface UpdateFormUiAction {
  type: typeof UPDATE_FORM_UI;
  payload: {
    formUiState: any;
  };
}

export function updateFormUi(formUiState: any): UpdateFormUiAction {
  return {
    type: UPDATE_FORM_UI,
    payload: {
      formUiState
    }
  };
}

//==============================================================================

export const SET_ERROR = 'downloadForm/set-error';

export interface SetErrorAction {
  type: typeof SET_ERROR;
  payload: {
    error: Error;
  };
}

export function setError(error: Error): SetErrorAction {
  return {
    type: SET_ERROR,
    payload: {
      error
    }
  };
}

//==============================================================================


type LoadPageDataAction =
  | StartLoadingAction
  | SetErrorAction
  | InitializeAction
  | SelectReporterAction

export function loadPageDataFromStepId(
  stepId: number, requestedFormat: string
): ActionThunk<LoadPageDataAction> {
  return function run({ wdkService }) {
    let preferencesPromise = wdkService.getCurrentUserPreferences();
    let ontologyPromise = wdkService.getOntology();
    let bundlePromise = getStepBundlePromise(stepId, wdkService);
    return [
      startLoading(),
      Promise.all([bundlePromise, preferencesPromise, ontologyPromise]).then(
        ([stepBundle, preferences, ontology]) => initialize({
          ...stepBundle,
          preferences,
          ontology,
          scope: 'results'
        }),
        (error: Error) => setError(error)
      ),
      bundlePromise.then(() => selectReporter(requestedFormat))
    ];
  }
}

export function loadPageDataFromRecord(
  recordClassUrlSegment: string,
  primaryKeyString: string,
  requestedFormat: string
): ActionThunk<LoadPageDataAction> {
  return function run({ wdkService }) {
    let preferencesPromise = wdkService.getCurrentUserPreferences();
    let ontologyPromise = wdkService.getOntology();
    // create promise for recordClass
    let recordClassPromise = wdkService.findRecordClass(r => r.urlSegment === recordClassUrlSegment);

    // create promise for record, dependent on result of recordClass promise
    let recordPromise = recordClassPromise.then(recordClass => {
      if (recordClass == null)
      throw new Error("Could not find record class identified by `" + recordClassUrlSegment + "`.");

      let pkValues = primaryKeyString.split(',');
      let pkArray = recordClass.primaryKeyColumnRefs.map((ref, index) => ({ name: ref, value: pkValues[index] }));
      return wdkService.getRecord(recordClass.urlSegment, pkArray, { attributes: [recordClass.recordIdAttributeName ] })
    });

    // create promise for bundle, dependent on previous two promises and primaryKeyString
    let bundlePromise = Promise
    .all([ recordClassPromise, recordPromise, primaryKeyString ])
    .then(getSingleRecordStepBundlePromise);

    return [
      startLoading(),
      // dispatch appropriate actions
      Promise.all([ bundlePromise, preferencesPromise, ontologyPromise ]).then(
        ([ stepBundle, preferences, ontology ]) =>
          initialize({
            ...stepBundle,
            preferences,
            ontology,
            scope: 'record'
          }),
        (error: Error) => setError(error)
      ),
      bundlePromise.then(() => selectReporter(requestedFormat))
    ];
  }
}

export function submitForm(
  step: Step,
  selectedReporter: string,
  formState: any,
  target = '_blank'
): ActionThunk<EmptyAction> {
  return ({ wdkService }) => {
    let answerRequest: AnswerRequest = {
      answerSpec: step.answerSpec,
      formatting: {
        format: selectedReporter ? selectedReporter : 'wdk-service-json',
        formatConfig: formState != null ? formState :
            { contentDisposition: 'attachment' }
      }
    };
    wdkService.downloadAnswer(answerRequest, target);
    return emptyAction;
  };
}
