import { getStepBundlePromise, getSingleRecordStepBundlePromise } from '../../Utils/stepUtils';
import { ActionThunk, EmptyAction, emptyAction } from '../../Utils/ActionCreatorUtils';
import { Step } from '../../Utils/WdkUser';
import { Question, RecordClass } from '../../Utils/WdkModel';
import { AnswerRequest } from '../../Utils/WdkService';

export type LoadingAction = {
  type: 'downloadForm/loading'
}

export type InitializeAction = {
  type: 'downloadForm/initialize',
  payload: {
    step: Step,
    question: Question,
    recordClass: RecordClass,
    scope: string
  }
}

export type SelectReporterAction = {
  type: 'downloadForm/selectReporter',
  payload: {
    selectedReporter: string
  }
}

export type UpdateAction = {
  type: 'downloadForm/formUpdate',
  payload: {
    formState: any
  }
}

export type UiUpdateAction = {
  type: 'downloadForm/formUiUpdate',
  payload: {
    formUiState: any
  }
}

export type ErrorAction = {
  type: 'downloadForm/error',
  payload: {
    error: Error
  }
}

export function selectReporter(reporterName: string): SelectReporterAction {
  return {
    type: 'downloadForm/selectReporter',
    payload: { selectedReporter: reporterName }
  };
}

export function updateFormState(newState: any): UpdateAction {
  return {
    type: 'downloadForm/formUpdate',
    payload: { formState: newState }
  };
}

export function updateFormUiState(newUiState: any): UiUpdateAction {
  return {
    type: 'downloadForm/formUiUpdate',
    payload: { formUiState: newUiState }
  };
}

export function loadPageDataFromStepId(
  stepId: number, requestedFormat: string
): ActionThunk<LoadingAction | ErrorAction | InitializeAction | SelectReporterAction> {
  return function run({ wdkService }) {
    let bundlePromise = getStepBundlePromise(stepId, wdkService);
    return [
      <LoadingAction>{ type: 'downloadForm/loading' },
      bundlePromise.then(
        stepBundle => (<InitializeAction>{
          type: 'downloadForm/initialize',
          payload: Object.assign(stepBundle, { scope: 'results' })
        }),
        (error: Error) => (<ErrorAction>{
          type: 'downloadForm/error',
          payload: { error }
        })
      ),
      bundlePromise.then(() => selectReporter(requestedFormat))
    ];
  }
}

export function loadPageDataFromRecord(
  recordClassUrlSegment: string,
  primaryKeyString: string,
  requestedFormat: string
): ActionThunk<LoadingAction | ErrorAction | InitializeAction | SelectReporterAction> {
  return function run({ wdkService }) {
    // create promise for recordClass
    let recordClassPromise = wdkService.findRecordClass(r => r.urlSegment === recordClassUrlSegment);

    // create promise for record, dependent on result of recordClass promise
    let recordPromise = recordClassPromise.then(recordClass => {
      if (recordClass == null)
      throw new Error("Could not find record class identified by `" + recordClassUrlSegment + "`.");

      let pkValues = primaryKeyString.split(',');
      let pkArray = recordClass.primaryKeyColumnRefs.map((ref, index) => ({ name: ref, value: pkValues[index] }));
      return wdkService.getRecord(recordClass.name, pkArray, { attributes: [recordClass.recordIdAttributeName ] })
    });

    // create promise for bundle, dependent on previous two promises and primaryKeyString
    let bundlePromise = Promise
    .all([ recordClassPromise, recordPromise, primaryKeyString ])
    .then(getSingleRecordStepBundlePromise);

    return [
      <LoadingAction>{ type: 'downloadForm/loading' },
      // dispatch appropriate actions
      bundlePromise.then(
        stepBundle => (<InitializeAction>{
          type: 'downloadForm/initialize',
          payload: Object.assign(stepBundle, { scope: 'record' })
        }),
        error => (<ErrorAction>{
          type: 'downloadForm/error',
          payload: { error }
        })
      ),
      bundlePromise.then(() => selectReporter(requestedFormat))
    ];
  }
}

// FIXME figure out what to do about "ActionCreators" that don't dispatch actions
// In this case, we just want access to wdkService.
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
