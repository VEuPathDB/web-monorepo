import {
  Action,
  trackUploadProgress,
  receiveBadUpload,
  receiveBadUploadHistoryAction,
  clearBadUpload,
} from '../Actions/UserDatasetUploadActions';

import { UserDatasetUpload } from '../Utils/types';
import { ValidationErrors } from '../Service/model/response-decoders';

export const key = 'userDatasetUpload';

export interface State {
  readonly uploads?: Array<UserDatasetUpload>;
  readonly badUploadMessage?: BadUpload;
  readonly badAllUploadsActionMessage?: { message: string; timestamp: number };
  readonly uploadProgress?: { progress: number | null };
}

export type BadUpload = { readonly timestamp: number; } & (
  | { type: 400, message: string; }
  | { type: 422, errors: ValidationErrors; }
  | { type: 500, message: string; }
)


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
