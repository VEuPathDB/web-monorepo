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
): React.ReactElement {
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

  const dataset = datasets[0];
  const isPublic = dataset.visibility === 'public';
  const isOwned = dataset.owner.userId === user.id;
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
        context={context}
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
                  updateDatasetCommunityVisibility(
                    [dataset.datasetId],
                    false,
                    context
                  )
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
                  updateDatasetCommunityVisibility(
                    [dataset.datasetId],
                    true,
                    context
                  )
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
