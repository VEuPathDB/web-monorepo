import * as actions from '../Actions/DatasetMetadataFormActions';
import * as vdi from '../Service/Model';
import * as util from '../Utils';
import { State } from './UserDatasetUploadStoreModule';

export function reduce(state: State = {}, action: actions.Action): State {
  switch (action.type) {
    case actions.overwriteMetaField.type:
      return updateMetadata(state, () => action.payload)

    case actions.updateCharacteristics.type:
      return updateMetadata(state, () => ({
        datasetCharacteristics: action.payload,
      }));

    case actions.updateContacts.type:
      return updateMetadata(state, () => ({ contacts: action.payload }));

    case actions.updateExternalBioprojectIds.type:
      return updateMetadata(state, it => ({
        externalIdentifiers: {
          ...it.externalIdentifiers,
          bioprojectIds: action.payload,
        },
      }));

    case actions.updateExternalDOIs.type:
      return updateMetadata(state, it => ({
        externalIdentifiers: {
          ...it.externalIdentifiers,
          dois: action.payload,
        },
      }));

    case actions.updateExternalHyperlinks.type:
      return updateMetadata(state, it => ({
        externalIdentifiers: {
          ...it.externalIdentifiers,
          hyperlinks: action.payload,
        },
      }));

    case actions.updatePublications.type:
      return updateMetadata(state, () => ({
        publications: action.payload,
      }));

    case actions.updateSources.type:
      return updateMetadata(state, () => ({
        datasetSources: action.payload,
      }));

    case actions.updateContentFlags.type:
      return updateMetadata(state, () => ({
        metadataContentFlags: action.payload,
      }));

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
        ...oldState.formState!.datasetDetails,
        ...updater(oldState.formState!.datasetDetails),
      },
    }
  };
}
