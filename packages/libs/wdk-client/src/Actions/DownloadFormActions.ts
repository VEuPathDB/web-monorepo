import { StepBundle, getStepBundlePromise, getSingleRecordStepBundlePromise, getStubbedStep } from 'wdk-client/Utils/stepUtils';
import { ActionThunk, EmptyAction, emptyAction, ActionCreatorResult } from 'wdk-client/Core/WdkMiddleware';
import { Step, UserPreferences } from 'wdk-client/Utils/WdkUser';
import { Question, RecordClass } from 'wdk-client/Utils/WdkModel';
import { AnswerRequest } from 'wdk-client/Service/Mixins/SearchReportsService';
import { CategoryOntology } from 'wdk-client/Utils/CategoryUtils';
import { WdkService } from 'wdk-client/Core';
import { updateParamValues } from 'wdk-client/Core/MoveAfterRefactor/Actions/StepAnalysis/StepAnalysisActionCreators';

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
    selectedReporter?: string;
  };
}

export function selectReporter(selectedReporter?: string): SelectReporterAction {
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
  stepId: number, requestedFormat?: string
): ActionThunk<LoadPageDataAction> {
  return function run({ wdkService }) {
    return getInitializationActionSet(
      wdkService, 'results', getStepBundlePromise(stepId, wdkService), requestedFormat
    );
  };
}

export function loadPageDataFromRecord(
  recordClassUrlSegment: string,
  primaryKeyString: string,
  requestedFormat?: string
): ActionThunk<LoadPageDataAction> {
  return function run({ wdkService }) {
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

    return getInitializationActionSet(
      wdkService, 'record', bundlePromise, requestedFormat
    );
  }
}

export function loadPageDataFromSearchConfig(
  searchName: string,
  paramValues: Record<string,string>,
  weight: number,
): ActionThunk<LoadPageDataAction> {
  return function run({ wdkService }) {

    // find question
    let questionPromise = wdkService
      .findQuestion(q => q.urlSegment === searchName);

    // find record class for that question
    let recordClassPromise = questionPromise
      .then(q => wdkService.findRecordClass(rc => rc.fullName == q.outputRecordClassName));

    // bundle these with a stub step to populate the store
    let bundlePromise = Promise.all([questionPromise, recordClassPromise])
      .then(([question, recordClass]) => ({
        question,
        recordClass,
        // make a stub step for the question and passed
        step: getStubbedStep(question, question.urlSegment, -1, {
          parameters: chooseParams(question, paramValues),
          wdkWeight: weight
        })
      }));

    return getInitializationActionSet(wdkService, 'results', bundlePromise);
  };
}

function chooseParams(question: Question, valueMap: Record<string,string>): Record<string,string> {
  let paramMap: Record<string,string> = {};
  question.paramNames.forEach(paramName => {
    if (Object.keys(valueMap).findIndex(key => key == paramName) == -1) {
      throw "Query string does not contain required parameter: " + paramName;
    }
    paramMap[paramName] = valueMap[paramName];
  });
  return paramMap;
}

function getInitializationActionSet(
    wdkService: WdkService,
    scope: string,
    bundlePromise: Promise<StepBundle>,
    requestedFormat?: string): ActionCreatorResult<LoadPageDataAction> {
  let preferencesPromise = wdkService.getCurrentUserPreferences();
  let ontologyPromise = wdkService.getOntology();
  return [
    startLoading(),
    Promise.all([bundlePromise, preferencesPromise, ontologyPromise]).then(
      ([stepBundle, preferences, ontology]) =>
        initialize({
          ...stepBundle,
          preferences,
          ontology,
          scope
        }),
      (error: Error) => setError(error)
    ),
    bundlePromise.then(() => selectReporter(requestedFormat))
  ];
}

//==============================================================================

export function submitForm(
  step: Step,
  selectedReporter: string,
  formState: any,
  target = '_blank'
): ActionThunk<EmptyAction> {
  return ({ wdkService }) => {
    let answerRequest: AnswerRequest = {
      answerSpec: {
        searchName: step.searchName,
        searchConfig: step.searchConfig
      },
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
