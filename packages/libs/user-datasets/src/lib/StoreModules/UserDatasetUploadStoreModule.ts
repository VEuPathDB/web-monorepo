import {
  Action,
  trackUploadProgress,
  receiveBadUpload,
  receiveBadUploadHistoryAction,
  clearBadUpload,
  updateFormState,
  updateFormMetadata,
  CitationRequested,
  CitationFound,
  CitationLookupFailed,
} from '../Actions/UserDatasetUploadActions';

import { BiFunction, Function, UserDatasetUpload } from '../Utils/types';
import {
  PartialDatasetDetails,
  DatasetUploads,
  ValidationErrors,
} from '../Service';
import { isEqual } from 'lodash';
import { useSelector } from 'react-redux';
import { StateSlice } from './types';
import { defaultDatasetDetails } from '../Service/Model/constructors';
import { runIfDefined } from '../Utils/ergonomics';

export const key = 'userDatasetUpload';

export interface DatasetFormState {
  /**
   * Metadata for the dataset being created or edited in the dataset form.
   */
  readonly datasetDetails: PartialDatasetDetails;

  /**
   * User file upload selections.
   */
  readonly fileUploads: DatasetUploads;

  /**
   * Client-side state used by the dataset form that is not passed to or used by
   * backend services.
   */
  readonly formMetaState: ClientSideUploadFormState;
}

/**
 * Upload form fields and flags that are only relevant to the client application
 * and are not used by any other user dataset features or functionality.
 */
export interface ClientSideUploadFormState {
  readonly isStudy: boolean | undefined;
  readonly hasExternalSources: boolean | undefined;
  readonly hasDisclaimer: boolean | undefined;
  readonly hasExperimentalOrganism: boolean | undefined;

  readonly publicationLookups: Record<string, DatasetPublicationLookupResult>;
}

export type DatasetPublicationLookupResult =
  | { readonly status: 'pending' }
  | {
      readonly status: 'complete';
      readonly content: string;
    }
  | { readonly status: 'not-found' }
  | {
      readonly status: 'failed';
      readonly error: Error;
    };

export const DefaultDatasetFormState: DatasetFormState = {
  datasetDetails: defaultDatasetDetails(),
  fileUploads: {},
  formMetaState: {
    isStudy: undefined,
    hasExternalSources: undefined,
    hasDisclaimer: undefined,
    hasExperimentalOrganism: undefined,
    publicationLookups: {},
  },
};

export function useDatasetFormState(): DatasetFormState {
  return (
    useSelector(
      (state: StateSlice) => state.userDatasetUpload.formState,
      isEqual
    ) ?? DefaultDatasetFormState
  );
}

export function useDatasetFormSelector<T>(
  selector: Function<DatasetFormState, T>,
  eqTest: BiFunction<T | undefined, T | undefined, boolean> = isEqual
): T | undefined {
  return useSelector<StateSlice, T | undefined>(
    (state: StateSlice) =>
      runIfDefined(state.userDatasetUpload.formState, selector),
    eqTest
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

    case CitationRequested.type:
    case CitationFound.type:
    case CitationLookupFailed.type:
      return {
        ...state,
        formState: {
          ...state.formState!,
          formMetaState: {
            ...state.formState!.formMetaState,
            publicationLookups: {
              ...state.formState!.formMetaState.publicationLookups,
              ...action.payload,
            },
          },
        },
      };

    default:
      return state;
  }
}
