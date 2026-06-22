import { IconAlt as Icon, Loading } from '@veupathdb/wdk-client/lib/Components';
import { Modal } from '@veupathdb/coreui';
import { FilledButton } from '@veupathdb/coreui';

import '../UserDatasets.scss';
import './UserDatasetSharingModal.scss';
import { User } from '@veupathdb/wdk-client/lib/Utils/WdkUser';
import { DatasetGetResponseBody, DatasetListEntry } from '../../Service';
import { updateDatasetCommunityVisibility } from '../../Actions/UserDatasetsActions';
import { DataNoun } from '../../Utils/types';
import { CommunityPromotionError } from './CommunityPromotionError';
import React, { ReactElement, ReactNode } from 'react';
import { CommunityAccess } from '../Misc/CommunityAccess';

export interface CommunityModalProps {
  readonly context: 'datasetDetails' | 'datasetsList';
  readonly datasets: Array<DatasetListEntry | DatasetGetResponseBody>;
  readonly dataNoun: DataNoun;
  readonly onClose: () => void;
  readonly updateDatasetCommunityVisibility: typeof updateDatasetCommunityVisibility;
  readonly updatePending: boolean;
  readonly updateSuccessful: boolean;
  readonly updateError: CommunityPromotionError | undefined;
  readonly user: User;
}

export default function UserDatasetSharingModal(
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
    <button className="btn" onClick={() => onClose()}>
      Close this window.
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
                  margin: '1em 0',
                },
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
                  margin: '1em 0',
                },
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

interface UpdateErrorsProps {
  readonly errors: CommunityPromotionError;
  readonly targetNounLower: string;
  readonly CloseButton: () => ReactElement;
  readonly context: 'datasetDetails' | 'datasetsList';
}

function UpdateErrors({
  errors,
  targetNounLower,
  CloseButton,
  context,
}: UpdateErrorsProps): ReactElement {
  let content: ReactNode;

  const inList = context === 'datasetsList';

  if (errors.validationErrors) {
    content = (
      <>
        <p>
          {inList ? 'One or more datasets do' : 'Your dataset does'} not contain
          enough information to be discoverable through <CommunityAccess />
          .
        </p>
        <p>
          Re-upload your {targetNounLower} and complete all sections on the
          upload form marked with a globe icon to enable <CommunityAccess />.
        </p>
        {inList
          ? undefined
          : detailedValidationContent(errors)}
      </>
    );
  } else {
    content = (
      <p>
        An error occurred while sharing your {targetNounLower}. Please try
        again.
      </p>
    );
  }

  return (
    <div className="UserDataset-SharingModal-StatusView">
      <Icon fa="times-circle danger" />
      <h2>Unable to Grant Public Access</h2>
      {content}
      <CloseButton />
    </div>
  );
}

function detailedValidationContent(errors: CommunityPromotionError): ReactElement {
  const rows: ReactElement[] = [];

  let hasDatasetCharacteristicsErrors = false;

  for (const errorSet of errors.validationErrors!) {
    for (const message of errorSet.general)
      rows.push(<tr><td colSpan={2}>{message}</td></tr>);

    for (const field of Object.keys(errorSet.byField).sort()) {
      // multi-word fields
      // what was the phrasing

      // Special case, datasetCharacteristics
      if (field.indexOf('datasetCharacteristics') > -1) {

        if (!hasDatasetCharacteristicsErrors) {
          rows.push(
            <tr>
              <th scope="row">Field Study or Clinical Trial Characteristics:</th>
              <td>all fields required</td>
            </tr>
          );

          hasDatasetCharacteristicsErrors = true;
        }

        continue;
      }

      let header: ReactNode = <th rowSpan={errorSet.byField[field].length}>
        {parseKey(field)}:
      </th>;

      for (const message of errorSet.byField[field]) {
        rows.push(
          <tr>
            {header}
            <td>{message}</td>
          </tr>
        );
      }
    }
  }

  return <details>
    <summary>Validation Details</summary>
    <table id="community-error-list">{rows}</table>
  </details>;
}

function parseKey(key: string): string {
  if (key.startsWith("$."))
    key = key.substring(2);

  const split = key.split(/\.|\[|].?/);
  const output = [];

  for (let i = 0; i < split.length; i++) {
    const maybeIndex = parseInt(split[i]);

    if (isNaN(maybeIndex)) {
      if (i > 0)
        break;

      output.push(capFirst(split[i]));
      continue
    }

    if (i > 0) {
      const prev: number = output.length - 1;
      output[prev] = output[prev].substring(0, output[prev].length - 1);
    }

    output[i] = (maybeIndex + 1).toString();
    break;
  }

  return output.join(' ');
}

// using this instead of other 'capitalize' functions because:
// lodash capitalize lowercases the rest of the word ???
// material-ui capitalize is removed in newer versions of mui
// css text-transform will capitalize every word
function capFirst(key: string): string {
  return key.substring(0, 1).toUpperCase() + key.substring(1);
}

function isAre(total: number) {
  return total === 1 ? 'is' : 'are';
}
