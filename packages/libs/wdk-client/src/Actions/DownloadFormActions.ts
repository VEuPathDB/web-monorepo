import {
  getStepBundlePromise,
  getSingleRecordStepBundlePromise,
  getStubbedStep,
} from '../Utils/stepUtils';
import {
  ActionThunk,
  EmptyAction,
  emptyAction,
  ActionCreatorResult,
} from '../Core/WdkMiddleware';
import { UserPreferences } from '../Utils/WdkUser';
import { Question, RecordClass } from '../Utils/WdkModel';
import { CategoryOntology } from '../Utils/CategoryUtils';
import { WdkService } from '../Core';
import {
  ResultType,
  getResultTypeDetails,
  downloadReport,
} from '../Utils/WdkResult';
import { STANDARD_REPORTER_NAME } from '../Views/ReporterForm/reporterUtils';

export type Action =
  | InitializeAction
  | SelectReporterAction
  | SetErrorAction
  | StartLoadingAction
  | UpdateFormAction
  | UpdateFormUiAction;

//==============================================================================

export const START_LOADING = 'downloadForm/start-loading';

export interface StartLoadingAction {
  type: typeof START_LOADING;
}

export function startLoading(): StartLoadingAction {
  return {
    type: START_LOADING,
  };
}

//==============================================================================

export const INITIALIZE = 'downloadForm/initialize';

export interface InitializeAction {
  type: typeof INITIALIZE;
  payload: {
    resultType: ResultType;
    question: Question;
    recordClass: RecordClass;
    scope: string;
    preferences: UserPreferences;
    ontology: CategoryOntology;
  };
}

export function initialize(
  data: InitializeAction['payload']
): InitializeAction {
  return {
    type: INITIALIZE,
    payload: data,
  };
}

//==============================================================================

export const SELECT_REPORTER = 'downloadForm/select-reporter';

// represents either the name of the reporter or the index in the reporter array
export type ReporterSelection = string | number;

export interface SelectReporterAction {
  type: typeof SELECT_REPORTER;
  payload: {
    selectedReporter?: ReporterSelection;
  };
}

export function selectReporter(
  selectedReporter?: ReporterSelection
): SelectReporterAction {
  return {
    type: SELECT_REPORTER,
    payload: {
      selectedReporter,
    },
  };
}

//==============================================================================

export const UPDATE_FORM = 'downloadForm/update-form';

export interface UpdateFormAction {
  type: typeof UPDATE_FORM;
  payload: {
    formState: any;
  };
}

export function updateForm(formState: any): UpdateFormAction {
  return {
    type: UPDATE_FORM,
    payload: {
      formState,
    },
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
      formUiState,
    },
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
      error,
    },
  };
}

//==============================================================================

type LoadPageDataAction =
  | StartLoadingAction
  | SetErrorAction
  | InitializeAction
  | SelectReporterAction;

export function loadPageDataFromStepId(
  stepId: number,
  requestedFormat?: ReporterSelection
): ActionThunk<LoadPageDataAction> {
  return function run({ wdkService }) {
    const resultTypeBundle = getStepBundlePromise(stepId, wdkService).then(
      ({ step, question, recordClass }) =>
        ({
          question,
          recordClass,
          resultType: {
            type: 'step',
            step,
          },
        } as ResultTypeBundle)
    );
    return getInitializationActionSet(
      wdkService,
      'results',
      resultTypeBundle,
      requestedFormat
    );
  };
}

export function loadPageDataFromRecord(
  recordClassUrlSegment: string,
  primaryKeyString: string,
  requestedFormat?: ReporterSelection
): ActionThunk<LoadPageDataAction> {
  return function run({ wdkService }) {
    // create promise for recordClass
    let recordClassPromise = wdkService.findRecordClass(recordClassUrlSegment);

    // create promise for record, dependent on result of recordClass promise
    let recordPromise = recordClassPromise.then((recordClass) => {
      if (recordClass == null)
        throw new Error(
          'Could not find record class identified by `' +
            recordClassUrlSegment +
            '`.'
        );

      let pkValues = primaryKeyString.split(',');
      let pkArray = recordClass.primaryKeyColumnRefs.map((ref, index) => ({
        name: ref,
        value: pkValues[index],
      }));
      return wdkService.getRecord(recordClass.urlSegment, pkArray, {
        attributes: [recordClass.recordIdAttributeName],
      });
    });

    // create promise for bundle, dependent on previous two promises and primaryKeyString
    let bundlePromise = Promise.all([recordClassPromise, recordPromise])
      .then(getSingleRecordStepBundlePromise(wdkService))
      .then(
        ({ answerSpec, recordClass, question, displayName }) =>
          ({
            resultType: {
              type: 'answerSpec',
              answerSpec,
              displayName,
            },
            question,
            recordClass,
          } as ResultTypeBundle)
      );

    return getInitializationActionSet(
      wdkService,
      'record',
      bundlePromise,
      requestedFormat
    );
  };
}

export function loadPageDataFromBasketName(
  basketName: string,
  requestedFormat?: ReporterSelection
): ActionThunk<LoadPageDataAction> {
  return function run({ wdkService }) {
    const resultType: ResultType = {
      type: 'basket',
      basketName,
    };
    const resultTypeBundlePromise = getResultTypeDetails(
      wdkService,
      resultType
    ).then(({ searchName, recordClassName }) => {
      return Promise.all([
        wdkService.findQuestion(searchName),
        wdkService.findRecordClass(recordClassName),
      ]).then(([question, recordClass]) => ({
        question,
        recordClass,
        resultType,
      }));
    });
    return getInitializationActionSet(
      wdkService,
      'results',
      resultTypeBundlePromise,
      requestedFormat
    );
  };
}

export function loadPageDataFromSearchConfig(
  searchName: string,
  paramValues: Record<string, string>,
  weight: number,
  requestedFormat?: ReporterSelection
): ActionThunk<LoadPageDataAction> {
  return function run({ wdkService }) {
    // find question
    let questionPromise = wdkService.findQuestion(searchName);

    // find record class for that question
    let recordClassPromise = questionPromise.then((q) =>
      wdkService.findRecordClass(q.outputRecordClassName)
    );

    // bundle these with a stub step to populate the store
    let bundlePromise = Promise.all([questionPromise, recordClassPromise]).then(
      ([question, recordClass]) =>
        ({
          question,
          recordClass,
          resultType: {
            type: 'step',
            // make a stub step for the question and passed
            step: getStubbedStep(question, question.urlSegment, -1, {
              parameters: chooseParams(question, paramValues),
              wdkWeight: weight,
            }),
          },
        } as ResultTypeBundle)
    );

    return getInitializationActionSet(
      wdkService,
      'results',
      bundlePromise,
      requestedFormat
    );
  };
}

function chooseParams(
  question: Question,
  valueMap: Record<string, string>
): Record<string, string> {
  let paramMap: Record<string, string> = {};
  question.paramNames.forEach((paramName) => {
    if (Object.keys(valueMap).findIndex((key) => key == paramName) == -1) {
      throw 'Query string does not contain required parameter: ' + paramName;
    }
    paramMap[paramName] = valueMap[paramName];
  });
  return paramMap;
}

interface ResultTypeBundle {
  resultType: ResultType;
  question: Question;
  recordClass: RecordClass;
}

function getInitializationActionSet(
  wdkService: WdkService,
  scope: string,
  resultTypeBundle: Promise<ResultTypeBundle>,
  requestedFormat?: ReporterSelection
): ActionCreatorResult<LoadPageDataAction> {
  let preferencesPromise = wdkService.getCurrentUserPreferences();
  let ontologyPromise = wdkService
    .getConfig()
    .then((config) => wdkService.getOntology(config.categoriesOntologyName));
  let initializePromise = Promise.all([
    resultTypeBundle,
    preferencesPromise,
    ontologyPromise,
  ]).then(
    ([stepBundle, preferences, ontology]) =>
      initialize({
        ...stepBundle,
        preferences,
        ontology,
        scope,
      }),
    (error: Error) => setError(error)
  );
  return [
    startLoading(),
    initializePromise,
    initializePromise.then(() => selectReporter(requestedFormat)),
  ];
}

//==============================================================================

export function submitForm(
  resultType: ResultType,
  selectedReporter: string,
  formState: any,
  target = '_blank'
): ActionThunk<EmptyAction> {
  return ({ wdkService }) => {
    const formatting = {
      format: selectedReporter ? selectedReporter : STANDARD_REPORTER_NAME,
      formatConfig:
        formState != null ? formState : { contentDisposition: 'attachment' },
    };
    downloadReport(wdkService, resultType, formatting, target);
    return emptyAction;
  };
}
