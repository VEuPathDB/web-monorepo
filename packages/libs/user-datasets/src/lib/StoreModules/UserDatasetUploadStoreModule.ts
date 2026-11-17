import * as upload from '../Actions/UserDatasetUploadActions';
import * as form from '../Actions/DatasetMetadataFormActions';
import * as util from '../Utils';
import * as vdi from '../Service/Model';

import { isEqual } from 'lodash';
import { useSelector } from 'react-redux';
import { StateSlice } from './types';
import { defaultDatasetDetails } from '../Service/Model/constructors';

export const key = 'userDatasetUpload';

export interface DatasetFormState {
  readonly datasetDetails: vdi.PartialDatasetDetails;

  readonly dataFileUrl?: string;

  /**
   * Index of data files that the user has selected keyed on the field name that
   * represents the file selection input.
   */
  readonly dataFileSelections: Readonly<Record<string, ReadonlyArray<vdi.UploadContent>>>;

  /**
   * Index of documentation files that the user has selected keyed on the field
   * name that represents the file selection input.
   */
  readonly documentFileSelections: Readonly<Record<string, ReadonlyArray<vdi.UploadContent>>>;

  /**
   * Index of data properties files that the user has selected keyed on the
   * field name that represents the file selection input.
   */
  readonly dataPropertiesFileSelections: Readonly<Record<string, ReadonlyArray<vdi.UploadContent>>>;
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
  readonly badUploadMessages?: ReadonlyArray<BadUpload>;
  readonly badAllUploadsActionMessage?: { message: string; timestamp: number };
  readonly uploadProgress?: { progress: number | null };
}

export type BadUpload =
  | { type: 400; message: string }
  | { type: 422; errors: vdi.ValidationErrors }
  | { type: 500; message: string };

export function reduce(state: State = {}, action: upload.Action | form.Action): State {
  switch (action.type) {

    case form.overwriteMetaField.type:
      return updateMetadata(state, () => action.payload)

    case form.updateCharacteristics.type:
      return updateMetadata(state, () => ({
        datasetCharacteristics: action.payload,
      }));

    case form.updateContacts.type:
      return updateMetadata(state, () => ({ contacts: action.payload }));

    case form.updateExternalBioprojectIds.type:
      return updateMetadata(state, it => ({
        externalIdentifiers: {
          ...it.externalIdentifiers,
          bioprojectIds: action.payload,
        },
      }));

    case form.updateExternalDOIs.type:
      return updateMetadata(state, it => ({
        externalIdentifiers: {
          ...it.externalIdentifiers,
          dois: action.payload,
        },
      }));

    case form.updateExternalHyperlinks.type:
      return updateMetadata(state, it => ({
        externalIdentifiers: {
          ...it.externalIdentifiers,
          hyperlinks: action.payload,
        },
      }));

    case form.updatePublications.type:
      return updateMetadata(state, () => ({
        publications: action.payload,
      }));

    case form.updateSources.type:
      return updateMetadata(state, () => ({
        datasetSources: action.payload,
      }));

    case form.updateContentFlags.type:
      return updateMetadata(state, () => ({
        metadataContentFlags: action.payload,
      }));

    case upload.receiveBadUpload.type:
      return { ...state, badUploadMessages: action.payload };

    case upload.clearBadUpload.type:
      return { ...state, badUploadMessages: undefined };

    case upload.trackUploadProgress.type:
      return { ...state, uploadProgress: action.payload };

    case upload.receiveBadUploadHistoryAction.type:
      return { ...state, badAllUploadsActionMessage: action.payload };

    case upload.updateFormMetadata.type:
      return {
        ...state,
        formState: {
          ...state.formState!,
          datasetDetails: action.payload,
        },
      };

    case upload.updateFormState.type:
      return { ...state, formState: action.payload };

    default:
      return state;
  }
}

function updateMetadata(oldState: State, updater: util.UnaryFunction<vdi.PartialDatasetDetails>): State {
  return {
    ...oldState,
    formState: {
      ...oldState.formState!,
      datasetDetails: {
        ...oldState.formState?.datasetDetails ?? {},
        ...updater(oldState.formState?.datasetDetails ?? {}),
      },
    }
  };
}
