import React from 'react';

import { IconAlt as Icon, Loading } from '@veupathdb/wdk-client/lib/Components';
import { Modal } from '@veupathdb/coreui';
import { FilledButton } from '@veupathdb/coreui';

import '../UserDatasets.scss';
import './UserDatasetSharingModal.scss';

export default function UserDatasetSharingModal(props) {
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
      dataset && dataset.ownerUserId && dataset.ownerUserId === user.id
  ).length;

  const totalCommunityDatasets = datasets.filter(
    (dataset) => dataset.meta.visibility === 'public'
  ).length;

  const totalNotOwnedDatasets = totalSelectedDatasets - totalOwnedDatasets;

  const targetNoun =
    totalSelectedDatasets === 1 ? dataNoun.singular : dataNoun.plural;
  const targetNounLower = targetNoun.toLowerCase();

  const datasetNoun =
    (totalSelectedDatasets === 1 ? 'this ' : 'these ') + targetNounLower;

  const CloseButton = () => (
    <button className="btn" onClick={() => onClose()}>
      Close this window.
    </button>
  );

  const content = updatePending ? (
    <Loading />
  ) : updateError ? (
    <div className="UserDataset-SharingModal-StatusView">
      <Icon fa="times-circle danger" />
      <h2>Error Sharing {targetNoun}.</h2>
      <p>
        An error occurred while sharing your {targetNounLower}. Please try
        again.
      </p>
      <CloseButton />
    </div>
  ) : updateSuccessful ? (
    <div className="UserDataset-SharingModal-StatusView">
      <Icon fa="check-circle success" />
      <h2>Community access updated successfully.</h2>
      <CloseButton />
    </div>
  ) : (
    <div className="UserDataset-SharingModal-FormView">
      <div className="UserDataset-SharingModal-VisibilitySection">
        <p className="UserDataset-SharingModal-Subtitle">
          <em>
            Community {dataNoun.plural} can be viewed and downloaded by all
            users.
          </em>
        </p>
        <div>
          <p>
            {totalSelectedDatasets} selected ({totalCommunityDatasets}{' '}
            {isAre(totalCommunityDatasets)} already in Community{' '}
            {dataNoun.plural}{' '}
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
                ? `Change Community access for ${totalOwnedDatasets} selected ${targetNounLower} that you own:`
                : `You do not own any of the selected datsets.`}
            </strong>
          </p>
          <FilledButton
            disabled={totalOwnedDatasets === 0}
            themeRole="primary"
            styleOverrides={{
              container: {
                margin: '1em 0',
              },
            }}
            text={`Grant access to ${totalOwnedDatasets} ${targetNounLower}`}
            onPress={() =>
              updateDatasetCommunityVisibility(
                datasets.map((d) => d.id),
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
                margin: '1em 0',
              },
            }}
            text={`Revoke access to ${totalOwnedDatasets} ${targetNounLower}`}
            onPress={() =>
              updateDatasetCommunityVisibility(
                datasets.map((d) => d.id),
                false,
                context
              )
            }
          />
        </div>
      </div>
    </div>
  );

  return (
    <Modal
      title={`Manage Community Access to ${datasetNoun}`}
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

function isAre(total) {
  return total === 1 ? 'is' : 'are';
}
