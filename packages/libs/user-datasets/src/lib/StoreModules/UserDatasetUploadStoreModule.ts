import { ActionsObservable, combineEpics, StateObservable } from 'redux-observable';
import { Observable } from 'rxjs';
import { filter, mergeMap } from 'rxjs/operators';
import { EpicDependencies } from '@veupathdb/wdk-client/lib/Core/Store';
import { RootState } from '@veupathdb/wdk-client/lib/Core/State/Types';
import { UserDatasetUpload } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { 
  Action,
  submitUploadForm,
  receiveBadUpload,
  requestUploadMessages,
  receiveUploadMessages,
  cancelCurrentUpload,
  clearMessages,
  receiveBadUploadHistoryAction
} from '../Actions/UserDatasetUploadActions';

export const key = 'userDatasetUpload';

export type State = {
  uploads?: Array<UserDatasetUpload>;
  badUploadMessage?: string;
  badAllUploadsActionMessage?: string;
}
export function reduce(state: State = {}, action: Action): State {
  switch(action.type) {
    case receiveBadUpload.type:
      return { ... state, badUploadMessage: action.payload.message};
    case receiveUploadMessages.type:
      return { ... state, uploads: action.payload.uploads};
    case receiveBadUploadHistoryAction.type:
      return { ... state, badAllUploadsActionMessage: action.payload.message};
    default:
      return state;
  }
}

export const observe = combineEpics(
  observeSubmitUploadForm,
  observeRequestUploadMessages,
  observeCancelCurrentUpload,
  observeClearMessages
);

function observeSubmitUploadForm(
  action$: ActionsObservable<Action>,
  state$: StateObservable<RootState>, dependencies: EpicDependencies
): Observable<Action> {
  return action$.pipe(
    filter(submitUploadForm.isOfType),
    mergeMap(async action => {
      try {
        await dependencies.wdkService.addDataset(action.payload.newUserDataset);
        dependencies.transitioner.transitionToInternalPage('/workspace/datasets/recent');
        return requestUploadMessages();
      } catch (err) {
        return receiveBadUpload(String(err) ?? "Failed to upload dataset");
      }
    })
  );
}
function observeRequestUploadMessages(
  action$: ActionsObservable<Action>,
  state$: StateObservable<RootState>, dependencies: EpicDependencies
): Observable<Action> {
  return action$.pipe(
    filter(requestUploadMessages.isOfType),
    mergeMap(async action => {
      try {
        const uploads = await dependencies.wdkService.listStatusDetails();
        return receiveUploadMessages(uploads);
      } catch (err) {
        return receiveBadUploadHistoryAction("Could not retrieve upload history\n" + err);
      }
    })
  );
}
function observeCancelCurrentUpload(
  action$: ActionsObservable<Action>,
  state$: StateObservable<RootState>, dependencies: EpicDependencies
): Observable<Action> {
  return action$.pipe(
    filter(cancelCurrentUpload.isOfType),
    mergeMap(async action => {
      try {
        await dependencies.wdkService.cancelOngoingUpload(action.payload.id);
        return requestUploadMessages(); 
      } catch (err) {
        return receiveBadUploadHistoryAction("Could not cancel current upload\n" + err);
      }
    })
  );
}

function observeClearMessages(
  action$: ActionsObservable<Action>,
  state$: StateObservable<RootState>, dependencies: EpicDependencies
): Observable<Action> {
  return action$.pipe(
    filter(clearMessages.isOfType),
    mergeMap(async action => {
      try {
        await dependencies.wdkService.clearMessages(action.payload.ids);
        return requestUploadMessages(); 
      } catch (err) {
        return receiveBadUploadHistoryAction("Could not clear messages\n" + err);
      }
    })
  );
}

