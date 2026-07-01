import { IconAlt as Icon, Loading } from '@veupathdb/wdk-client/lib/Components';
import { FilledButton, Modal } from '@veupathdb/coreui';

import '../UserDatasets.scss';
import './UserDatasetSharingModal.scss';
import { User } from '@veupathdb/wdk-client/lib/Utils/WdkUser';
import { DatasetGetResponseBody, DatasetListEntry } from '../../Service';
import { updateDatasetCommunityVisibility } from '../../Actions/UserDatasetsActions';
import { DataNoun } from '../../Utils/types';
import { CommunityPromotionError } from './CommunityPromotionError';
import React, { ReactElement } from 'react';
import { UpdateErrors } from './UpdateErrors';

export interface CommunityModalProps {
  readonly context: 'datasetDetails' | 'datasetsList';
  readonly datasets: Array<DatasetListEntry | DatasetGetResponseBody>;
  readonly dataNoun: DataNoun;
  readonly onClose: () => void;
  readonly onFixErrors: () => void;
  readonly updateDatasetCommunityVisibility: typeof updateDatasetCommunityVisibility;
  readonly updatePending: boolean;
  readonly updateSuccessful: boolean;
  readonly updateError: CommunityPromotionError | undefined;
  readonly user: User;
}

export default function UserDatasetCommunityModal(
  props: CommunityModalProps
): ReactElement {
  const {
    datasets,
    onClose,
    dataNoun,
    updateDatasetCommunityVisibility,
    updateSuccessful,
    updateError,
    context,
    updatePending,
    user,
  } = props;

  const totalSelectedDatasets = datasets.length;

  const totalOwnedDatasets = datasets.filter(
    (dataset) =>
      dataset && dataset.owner.userId && dataset.owner.userId === user.id
  ).length;

  const totalCommunityDatasets = datasets.filter(
    (dataset) => dataset.visibility === 'public'
  ).length;

  const totalNotOwnedDatasets = totalSelectedDatasets - totalOwnedDatasets;

  const targetNoun =
    totalSelectedDatasets === 1 ? dataNoun.singular : dataNoun.plural;
  const targetNounLower = targetNoun.toLowerCase();

  const datasetNoun =
    (totalSelectedDatasets === 1 ? 'this ' : 'these ') + targetNounLower;

  const CloseButton = () => (
    <button className="btn" type="button" onClick={() => onClose()}>
      Close this window
    </button>
  );

  let content: ReactElement;

  if (updatePending) {
    content = <Loading />;
  } else if (updateError) {
    content = (
      <UpdateErrors
        errors={updateError}
        targetNounLower={targetNounLower}
        CloseButton={CloseButton}
        onFixErrors={props.onFixErrors}
        context={context}
      />
    );
  } else if (updateSuccessful) {
    content = (
      <div className="UserDataset-SharingModal-StatusView">
        <Icon fa="check-circle success" />
        <h2>Public Access updated successfully.</h2>
        <CloseButton />
      </div>
    );
  } else {
    content = (
      <div className="UserDataset-SharingModal-FormView">
        <div className="UserDataset-SharingModal-VisibilitySection">
          <p className="UserDataset-SharingModal-Subtitle">
            <em>
              Public {dataNoun.plural} can be viewed and downloaded by all
              users.
            </em>
          </p>
          <div>
            <p>
              {totalSelectedDatasets} selected ({totalCommunityDatasets}{' '}
              {isAre(totalCommunityDatasets)} already Public {dataNoun.plural}{' '}
              {totalNotOwnedDatasets > 0
                ? `; ${totalNotOwnedDatasets} ${isAre(
                  totalNotOwnedDatasets
                )} owned by someone else`
                : ''}
              ).
            </p>
            <p>
              <strong>
                {totalOwnedDatasets > 0
                  ? `Change Public access for ${totalOwnedDatasets} selected ${targetNounLower} that you own:`
                  : `You do not own any of the selected datasets.`}
              </strong>
            </p>
            <FilledButton
              disabled={totalOwnedDatasets === 0}
              themeRole="primary"
              styleOverrides={{
                container: {
                  margin: '1em 0'
                }
              }}
              text={`Grant access to ${totalOwnedDatasets} ${targetNounLower}`}
              onPress={() =>
                updateDatasetCommunityVisibility(
                  datasets.map((d) => d.datasetId),
                  true,
                  context
                )
              }
            />
            <FilledButton
              disabled={totalOwnedDatasets === 0}
              themeRole="primary"
              styleOverrides={{
                container: {
                  margin: '1em 0'
                }
              }}
              text={`Revoke access to ${totalOwnedDatasets} ${targetNounLower}`}
              onPress={() =>
                updateDatasetCommunityVisibility(
                  datasets.map((d) => d.datasetId),
                  false,
                  context
                )
              }
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Modal
      title={`Manage Public Access to ${datasetNoun}`}
      themeRole="primary"
      includeCloseButton
      toggleVisible={onClose}
      visible
      titleSize="small"
    >
      <div className="UserDataset-SharingModal">{content}</div>
    </Modal>
  );
}

function isAre(total: number) {
  return total === 1 ? 'is' : 'are';
}
