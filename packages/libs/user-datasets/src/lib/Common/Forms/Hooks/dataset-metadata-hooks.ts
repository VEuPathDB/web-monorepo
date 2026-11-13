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

export function useDatasetMetadata(): util.Possible<vdi.PartialDatasetDetails> {
  return useSelector(identity);
}

export function useDatasetVisibility(): util.Possible<vdi.DatasetVisibility> {
  return useSelector(it => it.visibility);
}

export function useCharacteristics(): util.Possible<vdi.PartialCharacteristics> {
  return useSelector(it => it.datasetCharacteristics);
}

export function usePublications(): util.Possible<ReadonlyArray<vdi.PartialDatasetPublication>> {
  return useSelector(it => it.publications);
}

export function useContacts(): util.Possible<ReadonlyArray<vdi.PartialDatasetContact>> {
  return useSelector(it => it.contacts);
}

export function useExternalDOIs(): util.Possible<ReadonlyArray<vdi.DOIReference>> {
  return useSelector(it => it.externalIdentifiers?.dois);
}

export function useExternalHyperlinks(): util.Possible<ReadonlyArray<vdi.DatasetHyperlink>> {
  return useSelector(it => it.externalIdentifiers?.hyperlinks);
}

export function useExternalBioProjects(): util.Possible<ReadonlyArray<vdi.BioProjectId>> {
  return useSelector(it => it.externalIdentifiers?.bioprojectIds);
}

export function useContentFlags(): util.Possible<vdi.DatasetMetadataContentFlags> {
  return useSelector(it => it.metadataContentFlags);
}

export function useDataDisclaimer(): util.Possible<string> {
  return useSelector(it => it.dataDisclaimer);
}

export function useDatasetSources(): util.Possible<ReadonlyArray<vdi.PartialDatasetSource>> {
  return useSelector(it => it.datasetSources);
}
