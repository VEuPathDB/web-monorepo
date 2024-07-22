import React from 'react';

import {
  IconAlt as Icon,
  Loading,
  Modal,
} from '@veupathdb/wdk-client/lib/Components';
import { WdkDependenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';

import { FilledButton } from '@veupathdb/coreui';

import './UserDatasetSharingModal.scss';

class UserDatasetSharingModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // Can be one of 'pending' | 'success' | 'error'
      status: 'pending',
    };
    this.isMyDataset = this.isMyDataset.bind(this);
    this.getDatasetNoun = this.getDatasetNoun.bind(this);

    this.renderViewContent = this.renderViewContent.bind(this);
    this.isDatasetShareable = this.isDatasetShareable.bind(this);
  }

  isMyDataset(dataset) {
    const { user } = this.props;
    return dataset && dataset.ownerUserId && dataset.ownerUserId === user.id;
  }

  getDatasetNoun() {
    return this.props.datasets.length === 1
      ? `this ${this.props.dataNoun.singular.toLowerCase()}`
      : `these ${this.props.dataNoun.plural.toLowerCase()}`;
  }

  isDatasetShareable(dataset = {}) {
    return dataset.ownerUserId === this.props.user.id;
  }

  renderViewContent() {
    const {
      datasets,
      onClose,
      dataNoun,
      updateDatasetCommunityVisibility,
      updateSuccessful,
      updateError,
      context,
    } = this.props;
    const datasetNoun = this.getDatasetNoun();

    const CloseButton = () => (
      <button className="btn" onClick={() => onClose()}>
        Close this window.
      </button>
    );

    if (updateError) {
      return (
        <div className="UserDataset-SharingModal-StatusView">
          <Icon fa="times-circle danger" />
          <h2>Error Sharing {dataNoun.plural}.</h2>
          <p>
            An error occurred while sharing your {dataNoun.plural.toLowerCase()}
            . Please try again.
          </p>
          <CloseButton />
        </div>
      );
    } else if (updateSuccessful) {
      return (
        <div className="UserDataset-SharingModal-StatusView">
          <Icon fa="check-circle success" />
          <h2>Community access updated successfully.</h2>
          <CloseButton />
        </div>
      );
    } else {
      const totalSelectedDatasets = datasets.length;
      const totalOwnedDatasets = datasets.filter((dataset) =>
        this.isMyDataset(dataset)
      ).length;
      const totalCommunityDatasets = datasets.filter(
        (dataset) => dataset.meta.visibility === 'public'
      ).length;
      const targetNoun = (
        totalSelectedDatasets === 1 ? dataNoun.singular : dataNoun.plural
      ).toLowerCase();
      const totalNotOwnedDatasets = totalSelectedDatasets - totalOwnedDatasets;
      return (
        <div className="UserDataset-SharingModal-FormView">
          <div className="UserDataset-SharingModal-VisibilitySection">
            <h2 className="UserDatasetSharing-SectionName">
              Manage Community Access to {datasetNoun}
            </h2>
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
                    ? `Change Community access for ${totalOwnedDatasets} selected ${targetNoun}:`
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
                text={`Grant access to ${totalOwnedDatasets} ${targetNoun}`}
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
                text={`Revoke access to ${totalOwnedDatasets} ${targetNoun}`}
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
    }
  }

  render() {
    const { onClose, updatePending } = this.props;
    const ViewContent = this.renderViewContent;

    return (
      <Modal className="UserDataset-SharingModal">
        <div
          className="UserDataset-SharingModal-CloseBar"
          title="Close this window"
        >
          <Icon
            fa="window-close"
            className="SharingModal-Close"
            onClick={() => (typeof onClose === 'function' ? onClose() : null)}
          />
        </div>
        {updatePending ? <Loading /> : <ViewContent />}
      </Modal>
    );
  }
}

UserDatasetSharingModal.contextType = WdkDependenciesContext;

export default UserDatasetSharingModal;

function isAre(total) {
  return total === 1 ? 'is' : 'are';
}
