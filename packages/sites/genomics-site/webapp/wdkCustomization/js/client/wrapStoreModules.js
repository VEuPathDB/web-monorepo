import { flowRight, identity } from 'lodash';

import { useUserDatasetsWorkspace } from '@veupathdb/web-common/lib/config';

import * as blastSummaryView from '@veupathdb/blast-summary-view/lib/StoreModules/BlastSummaryViewStoreModule';

import { wrapStoreModules as addUserDatasetStoreModules } from '@veupathdb/user-datasets/lib/StoreModules';

import * as record from './storeModules/Record';
import * as userCommentForm from './storeModules/UserCommentFormStoreModule';
import * as userCommentShow from './storeModules/UserCommentShowStoreModule';
import * as genomeSummaryView from './storeModules/GenomeSummaryViewStoreModule';

export default flowRight(
  useUserDatasetsWorkspace ? addUserDatasetStoreModules : identity,
  (storeModules) => ({
    ...storeModules,
    record,
    userCommentForm,
    userCommentShow,
    blastSummaryView,
    genomeSummaryView,
  })
);
