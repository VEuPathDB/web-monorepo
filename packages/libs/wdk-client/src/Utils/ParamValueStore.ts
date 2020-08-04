import { memoize, noop } from 'lodash';

import { WdkService } from 'wdk-client/Core';
import { SearchConfig } from 'wdk-client/Utils/WdkModel';

type ParamValues = SearchConfig['parameters'];

interface ParamValueStore {
  clearParamValues: () =>  void;

  fetchParamValues: (
    recordClassUrlSegment: string,
    searchUrlSegment: string
  ) => Promise<ParamValues>;

  updateParamValues: (
    recordClassUrlSegment: string,
    searchUrlSegment: string,
    newParamValues: ParamValues
  ) => void;
}

export const getInstance = memoize(makeInstance);

function makeInstance(wdkService: WdkService): ParamValueStore {
  return {
    clearParamValues: noop,
    fetchParamValues: () => Promise.resolve({}),
    updateParamValues: noop
  };
}
