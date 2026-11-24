import * as Redux from 'react-redux';
import * as Store from '../StoreModules/types';
import * as Utils from '../Utils';
import * as WDK from '@veupathdb/wdk-client/lib/Utils/WdkUser';

export const useCurrentUser = (): Utils.Possible<WDK.User> =>
  Redux.useSelector((state: Store.StateSlice) => state.globalData.user);