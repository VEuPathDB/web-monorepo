import * as redux from 'react-redux';
import * as vdi from '../../../Service/Model';
import * as util from '../../../Utils';

import { StateSlice } from '../../../StoreModules/types';
import { identity, isEqual } from 'lodash';

export type MetadataSelector<T> = util.Function<vdi.PartialDatasetDetails, T>;

export const useMetadataSelector = <T>(fn: MetadataSelector<T>): util.Possible<T> =>
  redux.useSelector<StateSlice, util.Possible<T>>(
    state => util.ifDefined(state.userDatasetUpload.formState?.datasetDetails, fn),
    isEqual
  );

export const useDatasetMetadata = () =>
  useMetadataSelector<vdi.PartialDatasetDetails>(identity);

export const useDatasetVisibility = () => useMetadataSelector(it => it.visibility);

export const useDependencies = () => useMetadataSelector(it => it.dependencies);
