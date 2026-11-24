import * as redux from 'react-redux';
import lodash from 'lodash';
import { StateSlice } from '../../../StoreModules/types';

export const useBadUploadMessages = () => redux.useSelector(
  (state: StateSlice) => state.userDatasetUpload.badUploadMessages,
  lodash.isEqual
);

export const useUploadProgress = () =>
  redux.useSelector((state: StateSlice) => state.userDatasetUpload.uploadProgress?.progress);