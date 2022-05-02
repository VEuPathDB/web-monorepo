import { flowRight } from 'lodash';

import { wrapStoreModules as addUserDatasetStoreModules } from '@veupathdb/user-datasets/lib/StoreModules';

import * as globalData from './storeModules/GlobalData';
import * as record from './storeModules/Record';
import * as userCommentForm from './storeModules/UserCommentFormStoreModule';
import * as userCommentShow from './storeModules/UserCommentShowStoreModule';
import * as blastSummaryView from './storeModules/BlastSummaryViewStoreModule';
import * as genomeSummaryView from './storeModules/GenomeSummaryViewStoreModule';

export default flowRight(
  addUserDatasetStoreModules,
  storeModules => ({
    ...storeModules,
    record,
    globalData: {
      ...storeModules.globalData,
      reduce: (state, action) => {
        state = storeModules.globalData.reduce(state, action);
        return globalData.reduce(state, action);
      }
    },
    userCommentForm,
    userCommentShow,
    blastSummaryView,
    genomeSummaryView,
  })
);
