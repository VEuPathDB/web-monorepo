import * as redux from 'react-redux';
import * as vdi from '../../../Service/Model';
import * as util from '../../../Utils';

import { StateSlice } from '../../../StoreModules/types';
import { identity, isEqual } from 'lodash';

function useSelector<T>(fn: util.Function<vdi.PartialDatasetDetails, util.Possible<T>>): util.Possible<T> {
  return redux.useSelector<StateSlice, util.Possible<T>>(
    state => util.ifDefined(state.userDatasetUpload.formState?.datasetDetails, fn),
    isEqual
  );
}

export const useDatasetMetadata = () =>
  useSelector<vdi.PartialDatasetDetails>(identity);

export const useCharacteristics = () => useSelector(it => it.datasetCharacteristics);

export const useContacts = () => useSelector(it => it.contacts);

export const useContentFlags = () => useSelector(it => it.metadataContentFlags);

export const useDataDisclaimer = () => useSelector(it => it.dataDisclaimer);

export const useDatasetSources = () => useSelector(it => it.datasetSources);

export const useDatasetVisibility = () => useSelector(it => it.visibility);

export const useDependencies = () => useSelector(it => it.dependencies);

export const useExperimentalOrgs = () => useSelector(it => it.experimentalOrganisms);

export const useExternalBioProjects = () => useSelector(it => it.externalIdentifiers?.bioprojectIds);

export const useExternalDOIs = () => useSelector(it => it.externalIdentifiers?.dois);

export const useExternalHyperlinks = () => useSelector(it => it.externalIdentifiers?.hyperlinks);

export const usePublications = () => useSelector(it => it.publications);
