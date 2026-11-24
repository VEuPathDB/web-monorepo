import { IconAlt as Icon, Loading } from '@veupathdb/wdk-client/lib/Components';
import { FilledButton, Modal } from '@veupathdb/coreui';

import '../UserDatasets.scss';
import './UserDatasetSharingModal.scss';
import { DatasetGetResponseBody } from '../../Service';
import { updateDatasetCommunityVisibility } from '../../Actions/UserDatasetsActions';
import React, { ReactElement } from 'react';
import { UpdateErrors } from './UpdateErrors';
import { DataNoun } from '../../Common/Configuration';
import { useSelector } from 'react-redux';
import { StateSlice } from '../../StoreModules/types';
import { isEqual } from 'lodash';
import { User } from '@veupathdb/wdk-client/lib/Utils/WdkUser';

export type CommunityModalProps = {
  readonly currentUser: User;
  readonly dataset: DatasetGetResponseBody;
  readonly dataNoun: DataNoun;
  readonly onClose: () => void;
  readonly onFixErrors: () => void;
};

export const UserDatasetCommunityModal = (
  props: CommunityModalProps
): React.ReactElement => {
  const {
    dataset,
    onClose,
    dataNoun,
    currentUser
  } = props;

  const { updateError, updatePending, updateSuccessful } = useSelector(
    ({ userDatasetDetail }: StateSlice) => ({
      updatePending: userDatasetDetail?.updateDatasetCommunityVisibilityPending === true,
      updateSuccessful: userDatasetDetail?.updateDatasetCommunityVisibilitySuccess === true,
      updateError: userDatasetDetail?.updateDatasetCommunityVisibilityError,
    }),
    isEqual,
  );

  const isPublic = dataset.visibility === 'public';
  const isOwned = dataset.owner.userId === currentUser.id;
  const targetNounLower = dataNoun.singular.toLowerCase();
  const datasetNoun = 'this ' + targetNounLower;

  const CloseButton = () => (
    <button className="btn" type="button" onClick={() => onClose()}>
      Close this window
    </button>
  );

  let content: ReactElement;

  if (updatePending) content = <Loading />;
  else if (updateError)
    content = (
      <UpdateErrors
        errors={updateError}
        targetNounLower={targetNounLower}
        CloseButton={CloseButton}
        onFixErrors={props.onFixErrors}
      />
    );
  else if (updateSuccessful)
    content = (
      <div className="UserDataset-SharingModal-StatusView">
        <Icon fa="check-circle success" />
        <h2>Public Access updated successfully.</h2>
        <CloseButton />
      </div>
    );
  else
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
            {isPublic ? (
              <FilledButton
                disabled={!isOwned}
                themeRole="primary"
                styleOverrides={{
                  container: {
                    margin: '1em 0',
                  },
                }}
                text="Revoke public access"
                onPress={() =>
                  updateDatasetCommunityVisibility(dataset.datasetId, false)
                }
              />
            ) : (
              <FilledButton
                disabled={!isOwned}
                themeRole="primary"
                styleOverrides={{
                  container: {
                    margin: '1em 0',
                  },
                }}
                text="Grant public access"
                onPress={() =>
                  updateDatasetCommunityVisibility(dataset.datasetId, true)
                }
              />
            )}
          </div>
        </div>
      </div>
    );

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
