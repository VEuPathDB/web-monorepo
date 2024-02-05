// import {
//   ActionsObservable,
//   combineEpics,
//   StateObservable,
// } from 'redux-observable';
// import { Observable } from 'rxjs';
// import { filter, mergeMap } from 'rxjs/operators';

// import { EpicDependencies } from '@veupathdb/wdk-client/lib/Core/Store';

import {
  Action,
  trackUploadProgress,
  receiveBadUpload,
  // requestUploadMessages,
  // receiveUploadMessages,
  // cancelCurrentUpload,
  // clearMessages,
  receiveBadUploadHistoryAction,
  clearBadUpload,
} from '../Actions/UserDatasetUploadActions';

// import { assertIsVdiCompatibleWdkService } from '../Service';

// import { StateSlice } from '../StoreModules/types';

import { UserDatasetUpload } from '../Utils/types';

export const key = 'userDatasetUpload';

export type State = {
  uploads?: Array<UserDatasetUpload>;
  badUploadMessage?: { message: string; timestamp: number };
  badAllUploadsActionMessage?: { message: string; timestamp: number };
  uploadProgress?: { progress: number | null };
};
export function reduce(state: State = {}, action: Action): State {
  switch (action.type) {
    case receiveBadUpload.type:
      return { ...state, badUploadMessage: action.payload };
    case clearBadUpload.type:
      return { ...state, badUploadMessage: undefined };
    // case receiveUploadMessages.type:
    //   return { ...state, uploads: action.payload.uploads };
    case trackUploadProgress.type:
      return { ...state, uploadProgress: action.payload };
    case receiveBadUploadHistoryAction.type:
      return { ...state, badAllUploadsActionMessage: action.payload };
    default:
      return state;
  }
}

// export const observe = combineEpics(
//   // observeRequestUploadMessages,
//   // observeCancelCurrentUpload,
//   // observeClearMessages
// );

// function observeRequestUploadMessages(
//   action$: ActionsObservable<Action>,
//   state$: StateObservable<StateSlice>,
//   dependencies: EpicDependencies
// ): Observable<Action> {
//   return action$.pipe(
//     filter(requestUploadMessages.isOfType),
//     mergeMap(async (action) => {
//       assertIsVdiCompatibleWdkService(dependencies.wdkService);

//       try {
//         const uploads = await dependencies.wdkService.listStatusDetails();
//         return receiveUploadMessages(uploads);
//       } catch (err) {
//         return receiveBadUploadHistoryAction(
//           'Could not retrieve upload history\n' + err
//         );
//       }
//     })
//   );
// }

// function observeCancelCurrentUpload(
//   action$: ActionsObservable<Action>,
//   state$: StateObservable<StateSlice>,
//   dependencies: EpicDependencies
// ): Observable<Action> {
//   return action$.pipe(
//     filter(cancelCurrentUpload.isOfType),
//     mergeMap(async (action) => {
//       assertIsVdiCompatibleWdkService(dependencies.wdkService);

//       try {
//         await dependencies.wdkService.cancelOngoingUpload(action.payload.id);
//         return requestUploadMessages();
//       } catch (err) {
//         return receiveBadUploadHistoryAction(
//           'Could not cancel current upload\n' + err
//         );
//       }
//     })
//   );
// }

// function observeClearMessages(
//   action$: ActionsObservable<Action>,
//   state$: StateObservable<StateSlice>,
//   dependencies: EpicDependencies
// ): Observable<Action> {
//   return action$.pipe(
//     filter(clearMessages.isOfType),
//     mergeMap(async (action) => {
//       assertIsVdiCompatibleWdkService(dependencies.wdkService);

//       try {
//         await dependencies.wdkService.clearMessages(action.payload.ids);
//         return requestUploadMessages();
//       } catch (err) {
//         return receiveBadUploadHistoryAction(
//           'Could not clear messages\n' + err
//         );
//       }
//     })
//   );
// }
