import {
  Action,
  trackUploadProgress,
  receiveBadUpload,
  receiveBadUploadHistoryAction,
  clearBadUpload,
  updateFormState, updateFormMetadata
} from '../Actions/UserDatasetUploadActions';

import { UserDatasetUpload } from '../Utils/types';
import {
  PartialDatasetDetails,
  DatasetUploads,
  ValidationErrors,
} from '../Service';
import { isEqual } from 'lodash';
import { useSelector } from 'react-redux';
import { StateSlice } from './types';
import { defaultDatasetDetails } from '../Service/Model/constructors';

export const key = 'userDatasetUpload';

/**
 * Upload form fields and flags that are only relevant to the client application
 * and are not used by any other user dataset features or functionality.
 */
export interface ClientSideUploadFormState {
  readonly isStudy: boolean | undefined;
  readonly hasExternalSources: boolean | undefined;
  readonly hasDisclaimer: boolean | undefined;
}

function defaultClientOnlyFormState(): ClientSideUploadFormState {
  return {
    isStudy: undefined,
    hasExternalSources: undefined,
    hasDisclaimer: undefined,
  };
}

export interface DatasetFormState {
  readonly datasetDetails: PartialDatasetDetails;
  readonly fileUploads: DatasetUploads;
  readonly formMetaState: ClientSideUploadFormState;
}

export const DefaultUploadFormState: DatasetFormState = {
  datasetDetails: defaultDatasetDetails(),
  fileUploads: {},
  formMetaState: defaultClientOnlyFormState(),
};

export function useDatasetFormState(): DatasetFormState {
  return useSelector(
    (state: StateSlice) => state.userDatasetUpload.formState,
    isEqual,
  ) ?? DefaultUploadFormState;
}

export function useDatasetFormMetadata(): PartialDatasetDetails {
  return useSelector(
    (state: StateSlice) => state.userDatasetUpload.formState?.datasetDetails,
    isEqual,
  ) ?? DefaultUploadFormState.datasetDetails;
}

export interface State {
  readonly formState?: DatasetFormState;
  readonly uploads?: Array<UserDatasetUpload>;
  readonly badUploadMessage?: BadUpload;
  readonly badAllUploadsActionMessage?: { message: string; timestamp: number };
  readonly uploadProgress?: { progress: number | null };
}

export type BadUpload =
  | { type: 400; message: string }
  | { type: 422; errors: ValidationErrors }
  | { type: 500; message: string };

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
    case updateFormMetadata.type:
      return { ...state, formState: {
        ...state.formState!,
        datasetDetails: action.payload,
      } };
    case updateFormState.type:
      return { ...state, formState: action.payload };
    default:
      return state;
  }
}
