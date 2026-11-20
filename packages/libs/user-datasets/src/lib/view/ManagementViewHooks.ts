import * as Redux from 'react-redux';
import * as Store from './ManagementViewStore';
import * as Utils from '../Utils';
import Lodash from 'lodash';

const useSelector = <T>(fn: Utils.Function<Store.State, T>): T =>
  Redux.useSelector(fn, Lodash.isEqual);

export const useDatasetDetails = () =>
  useSelector(state => state.datasetDetails);

export const useDatasetStatus = () =>
  useSelector(state => state.datasetDetails?.status)

export const useCommunityUpdateState = () =>
  useSelector(state => state.communityUpdateState);

export const useDatasetFetchState = () =>
  useSelector(state => state.datasetFetchState);
