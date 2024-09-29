var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
import { combineEpics } from 'redux-observable';
import { filter, mergeMap } from 'rxjs/operators';
import {
  submitUploadForm,
  receiveBadUpload,
  requestUploadMessages,
  receiveUploadMessages,
  cancelCurrentUpload,
  clearMessages,
  receiveBadUploadHistoryAction,
  clearBadUpload,
} from '../Actions/UserDatasetUploadActions';
import { assertIsUserDatasetUploadCompatibleWdkService } from '../Service/UserDatasetUploadWrappers';
import { uploadUserDataset } from '../Utils/upload-user-dataset';
export const key = 'userDatasetUpload';
export function reduce(state = {}, action) {
  switch (action.type) {
    case receiveBadUpload.type:
      return Object.assign(Object.assign({}, state), {
        badUploadMessage: action.payload,
      });
    case clearBadUpload.type:
      return Object.assign(Object.assign({}, state), {
        badUploadMessage: undefined,
      });
    case receiveUploadMessages.type:
      return Object.assign(Object.assign({}, state), {
        uploads: action.payload.uploads,
      });
    case receiveBadUploadHistoryAction.type:
      return Object.assign(Object.assign({}, state), {
        badAllUploadsActionMessage: action.payload,
      });
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
function observeSubmitUploadForm(action$, state$, dependencies) {
  return action$.pipe(
    filter(submitUploadForm.isOfType),
    mergeMap((action) =>
      __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
          yield uploadUserDataset(
            dependencies.wdkService,
            action.payload.formSubmission
          );
          if (action.payload.redirectTo != null) {
            dependencies.transitioner.transitionToInternalPage(
              action.payload.redirectTo
            );
          }
          return requestUploadMessages();
        } catch (err) {
          return receiveBadUpload(
            (_a = String(err)) !== null && _a !== void 0
              ? _a
              : 'Failed to upload dataset'
          );
        }
      })
    )
  );
}
function observeRequestUploadMessages(action$, state$, dependencies) {
  return action$.pipe(
    filter(requestUploadMessages.isOfType),
    mergeMap((action) =>
      __awaiter(this, void 0, void 0, function* () {
        assertIsUserDatasetUploadCompatibleWdkService(dependencies.wdkService);
        try {
          const uploads = yield dependencies.wdkService.listStatusDetails();
          return receiveUploadMessages(uploads);
        } catch (err) {
          return receiveBadUploadHistoryAction(
            'Could not retrieve upload history\n' + err
          );
        }
      })
    )
  );
}
function observeCancelCurrentUpload(action$, state$, dependencies) {
  return action$.pipe(
    filter(cancelCurrentUpload.isOfType),
    mergeMap((action) =>
      __awaiter(this, void 0, void 0, function* () {
        assertIsUserDatasetUploadCompatibleWdkService(dependencies.wdkService);
        try {
          yield dependencies.wdkService.cancelOngoingUpload(action.payload.id);
          return requestUploadMessages();
        } catch (err) {
          return receiveBadUploadHistoryAction(
            'Could not cancel current upload\n' + err
          );
        }
      })
    )
  );
}
function observeClearMessages(action$, state$, dependencies) {
  return action$.pipe(
    filter(clearMessages.isOfType),
    mergeMap((action) =>
      __awaiter(this, void 0, void 0, function* () {
        assertIsUserDatasetUploadCompatibleWdkService(dependencies.wdkService);
        try {
          yield dependencies.wdkService.clearMessages(action.payload.ids);
          return requestUploadMessages();
        } catch (err) {
          return receiveBadUploadHistoryAction(
            'Could not clear messages\n' + err
          );
        }
      })
    )
  );
}
//# sourceMappingURL=UserDatasetUploadStoreModule.js.map
