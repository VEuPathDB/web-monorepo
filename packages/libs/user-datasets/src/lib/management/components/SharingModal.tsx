import React from 'react';
import Lodash from 'lodash';

import * as Utils from '../../Utils';

import { DataNoun } from '../../Common/Configuration';
import { DatasetGetResponseBody, DatasetListEntry } from '../../Service';
import UserDatasetSharingModal from '../../Components/Sharing/UserDatasetSharingModal';
import { useSelector } from 'react-redux';
import { StateSlice } from '../../StoreModules/types';
import { shareUserDatasets, unshareUserDataset, updateUserDatasetDetail } from '../../Actions/UserDatasetsActions';

export type DatasetSharingModalProps = {
  readonly dataNoun: DataNoun;
  readonly onClose: Utils.Runnable;
  readonly dataset: DatasetGetResponseBody;
};

/**
 * Ugly wrapper around the user dataset sharing modal class component to provide
 * values from hooks.
 */
export const DatasetSharingModalWrapper = (props: DatasetSharingModalProps): React.ReactElement => {
  const {
    user,
    shareError,
    shareSuccessful,
    sharingDatasetPending,
  } = useSelector(
    ({
      globalData: { user },
      userDatasetDetail: { shareError, shareSuccessful, sharingDatasetPending },
    }: StateSlice) => ({
      user,
      shareError,
      shareSuccessful,
      sharingDatasetPending
    }),
    Lodash.isEqual,
  )

  return (
    <UserDatasetSharingModal
      {...props}
      user={user!}
      context="datasetDetails"
      shareError={shareError}
      shareSuccessful={shareSuccessful}
      sharingDatasetPending={sharingDatasetPending}
      shareUserDatasets={shareUserDatasets}
      unshareUserDataset={unshareUserDataset}
      updateUserDatasetDetail={updateUserDatasetDetail}
    />
  );
}