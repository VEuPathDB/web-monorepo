import {
  Action,
  trackUploadProgress,
  receiveBadUpload,
  receiveBadUploadHistoryAction,
  clearBadUpload,
  updateFormState,
  updateFormMetadata,
} from '../Actions/UserDatasetUploadActions';

import { UserDatasetUpload } from '../Utils/types';
import {
  PartialDatasetDetails,
  ValidationErrors,
} from '../Service';
import { isEqual } from 'lodash';
import { useSelector } from 'react-redux';
import { StateSlice } from './types';
import { defaultDatasetDetails } from '../Service/Model/constructors';
import { UploadContent } from '../Service/Model';

export const key = 'userDatasetUpload';

export interface DatasetFormState {
  readonly datasetDetails: PartialDatasetDetails;

  readonly dataFileUrl?: string;

  /**
   * Index of data files that the user has selected keyed on the field name that
   * represents the file selection input.
   */
  readonly dataFileSelections: Readonly<Record<string, ReadonlyArray<UploadContent>>>;

  /**
   * Index of documentation files that the user has selected keyed on the field
   * name that represents the file selection input.
   */
  readonly documentFileSelections: Readonly<Record<string, ReadonlyArray<UploadContent>>>;

  /**
   * Index of data properties files that the user has selected keyed on the
   * field name that represents the file selection input.
   */
  readonly dataPropertiesFileSelections: Readonly<Record<string, ReadonlyArray<UploadContent>>>;
}

export const DefaultDatasetFormState: DatasetFormState = {
  datasetDetails: defaultDatasetDetails(),
  dataFileSelections: {},
  documentFileSelections: {},
  dataPropertiesFileSelections: {},
};

export function useDatasetFormState(): DatasetFormState {
  return (
    useSelector(
      (state: StateSlice) => state.userDatasetUpload.formState,
      isEqual
    ) ?? DefaultDatasetFormState
  );
}

export interface State {
  readonly formState?: DatasetFormState;
  readonly uploads?: Array<UserDatasetUpload>;
  readonly badUploadMessages?: BadUpload[];
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
      return { ...state, badUploadMessages: action.payload };
    case clearBadUpload.type:
      return { ...state, badUploadMessages: undefined };
    case trackUploadProgress.type:
      return { ...state, uploadProgress: action.payload };
    case receiveBadUploadHistoryAction.type:
      return { ...state, badAllUploadsActionMessage: action.payload };
    case updateFormMetadata.type:
      return {
        ...state,
        formState: {
          ...state.formState!,
          datasetDetails: action.payload,
        },
      };
    case updateFormState.type:
      return { ...state, formState: action.payload };
    default:
      return state;
  }
}
