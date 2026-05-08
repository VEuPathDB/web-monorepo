import {
  Action,
  trackUploadProgress,
  receiveBadUpload,
  receiveBadUploadHistoryAction,
  clearBadUpload,
  updateFormState,
} from '../Actions/UserDatasetUploadActions';

import { UserDatasetUpload } from '../Utils/types';
import {
  DatasetPostDetails,
  DatasetUploads,
  ValidationErrors,
} from '../Service';
import { useSelector } from 'react-redux';
import { StateSlice } from './types';

export const key = 'userDatasetUpload';

/**
 * Upload form fields and flags that are only relevant to the client application
 * and are not used by any other user dataset features or functionality.
 */
export interface ClientSideUploadFormState {
  /**
   * Whether the user dataset being uploaded contains study data.
   *
   * This flag enables the study characteristics form fields.
   */
  readonly isStudy: boolean;

  readonly hasExternalSources: boolean;
}

function defaultClientOnlyFormState(): ClientSideUploadFormState {
  return {
    isStudy: false,
    hasExternalSources: false,
  };
}

export interface UploadFormState {
  readonly datasetDetails: DatasetPostDetails;
  readonly fileUploads: DatasetUploads;
  readonly formMetaState: ClientSideUploadFormState;
}

export function defaultUploadFormState(): UploadFormState {
  return {
    datasetDetails: {},
    fileUploads: {},
    formMetaState: defaultClientOnlyFormState(),
  };
}

export function useUploadFormState(): UploadFormState {
  return (
    useSelector((state: StateSlice) => state.userDatasetUpload.formState) ??
    defaultUploadFormState()
  );
}

export interface State {
  readonly formState?: UploadFormState;
  readonly uploads?: Array<UserDatasetUpload>;
  readonly badUploadMessage?: BadUpload;
  readonly badAllUploadsActionMessage?: { message: string; timestamp: number };
  readonly uploadProgress?: { progress: number | null };
}

export type BadUpload = { readonly timestamp: number } & (
  | { type: 400; message: string }
  | { type: 422; errors: ValidationErrors }
  | { type: 500; message: string }
);

export function reduce(state: State = {}, action: Action): State {
  switch (action.type) {
    case receiveBadUpload.type:
      return { ...state, badUploadMessage: action.payload };
    case clearBadUpload.type:
      return { ...state, badUploadMessage: undefined };
    case trackUploadProgress.type:
      return { ...state, uploadProgress: action.payload };
    case receiveBadUploadHistoryAction.type:
      return { ...state, badAllUploadsActionMessage: action.payload };
    case updateFormState.type:
      return { ...state, formState: action.payload };
    default:
      return state;
  }
}
