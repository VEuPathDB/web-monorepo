import React from 'react';
import { Public } from '@material-ui/icons';

import Icon from '@veupathdb/wdk-client/lib/Components/Icon/IconAlt';
import SaveableTextEditor from '@veupathdb/wdk-client/lib/Components/InputControls/SaveableTextEditor';
import Link from '@veupathdb/wdk-client/lib/Components/Link';
import {
  AnchoredTooltip,
  Mesa,
  MesaState,
} from '@veupathdb/coreui/lib/components/Mesa';
import { WdkDependenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
import { bytesToHuman } from '@veupathdb/wdk-client/lib/Utils/Converters';

import NotFound from '@veupathdb/wdk-client/lib/Views/NotFound/NotFound';

import SharingModal from '../Sharing/UserDatasetSharingModal';
import CommunityModal from '../Sharing/UserDatasetCommunityModal';
import UserDatasetStatus from '../UserDatasetStatus';
import { makeClassifier, normalizePercentage } from '../UserDatasetUtils';
import { ThemedGrantAccessButton } from '../ThemedGrantAccessButton';
import { ThemedDeleteButton } from '../ThemedDeleteButton';

import { DateTime } from '../DateTime';

import './UserDatasetDetail.scss';

const classify = makeClassifier('UserDatasetDetail');

class UserDatasetDetail extends React.Component {
  constructor(props) {
    super(props);

    this.onMetaSave = this.onMetaSave.bind(this);
    this.isMyDataset = this.isMyDataset.bind(this);
    this.validateKey = this.validateKey.bind(this);
    this.handleDelete = this.handleDelete.bind(this);

    this.getAttributes = this.getAttributes.bind(this);
    this.renderAttributeList = this.renderAttributeList.bind(this);
    this.renderHeaderSection = this.renderHeaderSection.bind(this);
    this.renderDatasetActions = this.renderDatasetActions.bind(this);

    this.renderCompatibilitySection =
      this.renderCompatibilitySection.bind(this);
    this.getCompatibilityStatus = this.getCompatibilityStatus.bind(this);
    this.getCompatibilityTableColumns =
      this.getCompatibilityTableColumns.bind(this);

    this.openSharingModal = this.openSharingModal.bind(this);
    this.renderFileSection = this.renderFileSection.bind(this);
    this.closeSharingModal = this.closeSharingModal.bind(this);
    this.getFileTableColumns = this.getFileTableColumns.bind(this);
    this.renderDetailsSection = this.renderDetailsSection.bind(this);
    this.renderAllDatasetsLink = this.renderAllDatasetsLink.bind(this);
  }

  isMyDataset() {
    const { user, userDataset } = this.props;
    return (
      user && userDataset && user.id && user.id === userDataset.ownerUserId
    );
  }

  openSharingModal() {
    this.props.sharingSuccess(undefined);
    this.props.sharingError(undefined);
    this.props.updateSharingModalState(true);
  }

  closeSharingModal() {
    this.props.updateSharingModalState(false);
  }

  validateKey(key) {
    const META_KEYS = ['name', 'summary', 'description'];
    if (typeof key !== 'string' || !META_KEYS.includes(key))
      throw new TypeError(
        `Can't edit meta for invalid key: ${JSON.stringify(key)}`
      );
  }

  onMetaSave(key) {
    this.validateKey(key);
    return (value) => {
      if (typeof value !== 'string')
        throw new TypeError(
          `onMetaSave: expected input value to be string; got ${typeof value}`
        );
      const { userDataset, updateUserDatasetDetail } = this.props;
      const meta = { ...userDataset.meta, [key]: value };
      return updateUserDatasetDetail(userDataset, meta);
    };
  }

  handleDelete() {
    const { baseUrl, isOwner, userDataset, removeUserDataset, dataNoun } =
      this.props;
    const { sharedWith } = userDataset;
    const shareCount = !Array.isArray(sharedWith) ? null : sharedWith.length;

    const question = `Are you sure you want to ${
      isOwner ? 'delete' : 'remove'
    } this ${dataNoun.singular.toLowerCase()}? `;

    const visibilityMessage =
      userDataset.meta.visibility === 'public'
        ? 'It will no longer be visible to the community'
        : null;

    const shareMessage =
      !isOwner || !shareCount
        ? ''
        : `${shareCount} collaborator${
            shareCount === 1 ? '' : 's'
          } you've shared with will lose access.`;

    const message =
      question +
      (visibilityMessage && shareMessage
        ? `${visibilityMessage}, and ${shareMessage}`
        : visibilityMessage || shareMessage);

    if (window.confirm(message)) {
      removeUserDataset(userDataset, baseUrl);
    }
  }

  renderAllDatasetsLink() {
    return (
      <Link className="AllDatasetsLink" to={this.props.baseUrl}>
        <Icon fa="chevron-left" />
        &nbsp; All {this.props.workspaceTitle}
      </Link>
    );
  }

  getAttributes() {
    const { userDataset, quotaSize, questionMap, dataNoun, config } =
      this.props;
    const { onMetaSave } = this;
    const {
      id,
      type,
      meta,
      size,
      percentQuotaUsed,
      owner,
      created,
      sharedWith,
      status,
    } = userDataset;
    const { display, name, version } = type;
    const isOwner = this.isMyDataset();
    const isInstalled =
      status?.import === 'complete' &&
      status?.install?.find((d) => d.projectId === config.projectId)
        ?.dataStatus === 'complete';
    const questions = Object.values(questionMap).filter(
      (q) =>
        'userDatasetType' in q.properties &&
        q.properties.userDatasetType.includes(type.name)
    );

    return [
      {
        attribute: this.props.detailsPageTitle,
        className: classify('Name'),
        value: (
          <SaveableTextEditor
            value={meta.name}
            readOnly={!isOwner}
            onSave={this.onMetaSave('name')}
          />
        ),
      },
      {
        attribute: 'Status',
        value: (
          <UserDatasetStatus
            linkToDataset={false}
            useTooltip={false}
            userDataset={userDataset}
            projectId={this.props.config.projectId}
            displayName={this.props.config.displayName}
            dataNoun={dataNoun}
          />
        ),
      },
      {
        attribute: 'Visibility',
        value:
          meta.visibility === 'public' ? (
            <>
              {' '}
              <Public className="Community-visible" /> This{' '}
              {dataNoun.singular.toLowerCase()} is visible to the community.
            </>
          ) : (
            <>
              This {dataNoun.singular.toLowerCase()} is only visible to the
              owner and those they have shared it with.
            </>
          ),
      },
      !isOwner || !sharedWith || !sharedWith.length
        ? null
        : {
            attribute: 'Shared with',
            value: (
              <ul>
                {sharedWith.map((share, index) => (
                  <li key={`${share.userDisplayName}-${index}`}>
                    {share.userDisplayName}
                  </li>
                ))}
              </ul>
            ),
          },
      {
        attribute: 'Owner',
        value: isOwner ? 'Me' : owner,
      },
      { attribute: 'ID', value: id },
      {
        attribute: 'Data type',
        value: (
          <span>
            {display} ({name} {version})
          </span>
        ),
      },
      {
        attribute: 'Created',
        value: <DateTime datetime={created} />,
      },
      { attribute: 'Data set size', value: bytesToHuman(size) },
      !isOwner
        ? null
        : {
            attribute: 'Quota usage',
            value: `${normalizePercentage(percentQuotaUsed)}% of ${bytesToHuman(
              quotaSize
            )}`,
          },
      {
        attribute: 'Summary',
        value: (
          <SaveableTextEditor
            multiLine={true}
            value={meta.summary}
            readOnly={!isOwner}
            onSave={onMetaSave('summary')}
            emptyText="No Summary"
          />
        ),
      },
      {
        attribute: 'Description',
        value: (
          <SaveableTextEditor
            value={meta.description}
            multiLine={true}
            readOnly={!isOwner}
            onSave={this.onMetaSave('description')}
            emptyText="No Description"
          />
        ),
      },
      !questions || !questions.length || !isInstalled
        ? null
        : {
            attribute: 'Available searches',
            value: (
              <ul>
                {questions.map((q) => {
                  // User dataset searches typically offer changing the dataset through a dropdown
                  // Ths dropdown is a param, "biom_dataset" on MicrobiomeDB and "rna_seq_dataset" on genomic sites
                  // Hence the regex: /dataset/
                  const ps = q.paramNames.filter((paramName) =>
                    paramName.match(/dataset/)
                  );
                  const urlPath = [
                    '',
                    'search',
                    q.outputRecordClassName,
                    q.urlSegment,
                  ].join('/');
                  const url =
                    urlPath +
                    (ps.length === 1 ? '?param.' + ps[0] + '=' + id : '');
                  return (
                    <li key={q.fullName}>
                      <Link to={url}>{q.displayName}</Link>
                    </li>
                  );
                })}
              </ul>
            ),
          },
    ].filter((attr) => attr);
  }

  renderHeaderSection() {
    const AllLink = this.renderAllDatasetsLink;
    const AttributeList = this.renderAttributeList;
    const DatasetActions = this.renderDatasetActions;

    return (
      <section id="dataset-header">
        <AllLink />
        <div className={classify('Header')}>
          <div className={classify('Header-Attributes')}>
            <AttributeList />
          </div>
          <div className={classify('Header-Actions')}>
            <DatasetActions />
          </div>
        </div>
      </section>
    );
  }

  renderAttributeList() {
    const attributes = this.getAttributes();
    return (
      <div className={classify('AttributeList')}>
        {attributes.map(({ attribute, value, className }, index) => (
          <div
            className={
              classify('AttributeRow') +
              ' ' +
              (className ?? classify(attribute))
            }
            key={index}
          >
            <div className={classify('AttributeName')}>
              {typeof attribute === 'string' ? (
                <strong>{attribute}:</strong>
              ) : (
                attribute
              )}
            </div>
            <div className={classify('AttributeValue')}>{value}</div>
          </div>
        ))}
      </div>
    );
  }

  renderDatasetActions() {
    const isOwner = this.isMyDataset();
    return (
      <div className={classify('Actions')}>
        {!isOwner ? null : (
          <ThemedGrantAccessButton
            buttonText={`Grant Access to ${this.props.dataNoun.plural}`}
            onPress={(grantType) => {
              switch (grantType) {
                case 'community':
                  this.props.updateCommunityModalVisibility(true);
                  break;
                case 'individual':
                  this.openSharingModal();
                  break;
                default:
                  // noop
                  break;
              }
            }}
            enablePublicUserDatasets={this.props.enablePublicUserDatasets}
          />
        )}
        {isOwner ? (
          <ThemedDeleteButton buttonText="Delete" onPress={this.handleDelete} />
        ) : null}
      </div>
    );
  }

  renderDetailsSection() {
    const { userDataset } = this.props;
    return (
      <section>
        <details>
          <pre>
            <code>{JSON.stringify(userDataset, null, '  ')}</code>
          </pre>
        </details>
      </section>
    );
  }

  /* -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

                                    Files Table

   -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */

  renderFileSection() {
    const { userDataset, dataNoun } = this.props;
    const { fileListing } = userDataset;
    const uploadZipFileState = MesaState.create({
      columns: this.getFileTableColumns('upload'),
      rows: [{ name: 'upload.zip', size: fileListing?.upload?.zipSize }],
    });
    const processedZipFileState = MesaState.create({
      columns: this.getFileTableColumns('data'),
      rows: [{ name: 'install.zip', size: fileListing?.install?.zipSize }],
    });

    return (
      <section id="dataset-files">
        <h2>Data Files</h2>
        <h3 className={classify('SectionTitle')}>
          <Icon fa="files-o" />
          Uploaded Files in {dataNoun.singular}
        </h3>
        <Mesa state={uploadZipFileState} />
        <h3 className={classify('SectionTitle')}>
          <Icon fa="files-o" />
          Processed Files in {dataNoun.singular}
        </h3>
        <Mesa state={processedZipFileState} />
      </section>
    );
  }

  getFileTableColumns(fileType) {
    const { userDataset, config } = this.props;
    const { projectId } = config;
    const { id, fileListing, status } = userDataset;
    const { wdkService } = this.context;

    const fileListIndex = fileType === 'upload' ? 'upload' : 'install';

    const fileListElement = fileListing[fileListIndex]?.contents?.length && (
      <details style={{ margin: '1em 0 0 0.25em' }}>
        <summary>
          List of {fileType === 'upload' ? 'uploaded' : 'processed'} files:
        </summary>
        <ol
          style={{
            margin: '0.25em 0 0 0',
            lineHeight: '1.5em',
            padding: '0 0 0 2em',
          }}
        >
          {fileListing[fileListIndex].contents.map((file, index) => (
            <li key={`${file.fileName}-${index}`}>
              {file.fileName} <span>({bytesToHuman(file.fileSize)})</span>
            </li>
          ))}
        </ol>
      </details>
    );

    return [
      {
        key: 'name',
        name: 'File Name',
        renderCell({ row }) {
          const { name } = row;
          return (
            <>
              <code>{name}</code>
              {fileListElement}
            </>
          );
        },
      },
      {
        key: 'size',
        name: 'File Size',
        renderCell({ row }) {
          const { size } = row;
          return size ? bytesToHuman(size) : '';
        },
      },
      {
        key: 'download',
        name: 'Download',
        width: '130px',
        headingStyle: { textAlign: 'center' },
        renderCell() {
          const downloadServiceAvailable = 'getUserDatasetFiles' in wdkService;
          const enableDownload =
            fileType === 'upload'
              ? true
              : status.install?.find((d) => d.projectId === projectId)
                  ?.dataStatus === 'complete';

          return (
            <button
              className="btn btn-info"
              disabled={!downloadServiceAvailable || !enableDownload}
              title={
                downloadServiceAvailable && enableDownload
                  ? 'Download this file'
                  : 'This download is unavailable. Please contact us if this problem persists.'
              }
              onClick={(e) => {
                e.preventDefault();
                wdkService.getUserDatasetFiles(id, fileType);
              }}
            >
              <Icon fa="save" className="left-side" /> Download
            </button>
          );
        },
      },
    ].filter((column) => column);
  }

  /* -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

                                Compatible Table

   -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */

  renderCompatibilitySection() {
    const { userDataset, config, dataNoun } = this.props;
    const { displayName } = config;

    const compatibilityTableState = MesaState.create({
      columns: this.getCompatibilityTableColumns(userDataset),
      rows: userDataset.dependencies,
    });

    const compatibilityStatus = this.getCompatibilityStatus();

    return (
      <section id="dataset-compatibility">
        <h2>
          Use This {dataNoun.singular} in {displayName}
        </h2>
        <h3 className={classify('SectionTitle')}>
          <Icon fa="puzzle-piece" />
          Compatibility Information &nbsp;
          <AnchoredTooltip
            content={`The data and genomes listed here are requisite for using the data in this user ${dataNoun.singular.toLowerCase()}.`}
          >
            <div className="HelpTrigger">
              <Icon fa="question-circle" />
            </div>
          </AnchoredTooltip>
        </h3>
        <div style={{ maxWidth: '600px' }}>
          <Mesa state={compatibilityTableState} />
        </div>
        {compatibilityStatus}
      </section>
    );
  }

  getCompatibilityStatus() {
    const { userDataset, config, dataNoun } = this.props;
    const { projectId } = config;

    const { status, projects } = userDataset;

    /**
     * In VDI, we know a dataset is compatible when the site-specific's install status
     * indicates a successful install.
     *
     * We know a dataset is incompatible when the site-specific's install status
     * indicates `missing-dependency`
     */
    const installStatusForCurrentProject = status.install?.find(
      (d) => d.projectId === projectId
    );

    const isTargetingCurrentSite = projects.includes(projectId);
    const isInstalled = [
      userDataset.status.import,
      installStatusForCurrentProject?.metaStatus,
      installStatusForCurrentProject?.dataStatus,
    ].every((status) => status === 'complete');

    const isIncompatible =
      installStatusForCurrentProject?.dataStatus === 'missing-dependency';

    if (!isTargetingCurrentSite || (isTargetingCurrentSite && isIncompatible)) {
      return (
        // if projectIds don't match, then we're not installable and thus incompatible
        // if we're installable but failed due to a missing dependency, we're incompatible
        <p className="danger">
          This {dataNoun.singular.toLowerCase()} is not compatible with{' '}
          <b>{projectId}</b>.
        </p>
      );
    } else if (isInstalled) {
      return (
        // if we've installed successfully and we're installable, we're compatible
        <p className="success">
          This {dataNoun.singular.toLowerCase()} is compatible with{' '}
          <b>{projectId}</b>. It is installed for use.
        </p>
      );
    } else {
      // instead of attempting to provide very granular messaging for when things are neither
      // compatible nor incompatible, let's let the dataset page's Status messaging handle this
      return null;
    }
  }

  getCompatibilityTableColumns() {
    const { userDataset } = this.props;
    const { projects } = userDataset;
    return [
      {
        key: 'project',
        name: 'VEuPathDB Website',
        renderCell() {
          return projects.join(', ');
        },
      },
      {
        key: 'resourceDisplayName',
        name: 'Required Resource',
        renderCell({ row }) {
          const { resourceDisplayName } = row;
          return resourceDisplayName;
        },
      },
      {
        key: 'resourceVersion',
        name: 'Required Resource Release',
        renderCell({ row }) {
          const { resourceVersion } = row;
          return resourceVersion;
        },
      },
    ];
  }

  /* -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

                                General Rendering

   -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */

  // This is needed to resolve downstream typescript errors.
  // TypeScript infers that this method returns JSX.Element[].
  // Some classes extending this will return (JSX.Element | null)[].
  // The ReactNode type is better suited, here, since it allows for null values.
  /** @return {import("react").ReactNode[]} */
  getPageSections() {
    return [
      this.renderHeaderSection,
      this.renderCompatibilitySection,
      this.renderFileSection,
    ];
  }

  render() {
    const {
      user,
      userDataset,
      shareUserDatasets,
      unshareUserDatasets,
      dataNoun,
      sharingModalOpen,
      sharingDatasetPending,
      shareSuccessful,
      shareError,
      updateUserDatasetDetail,
      enablePublicUserDatasets,
      updateDatasetCommunityVisibility,
      updateCommunityModalVisibility,
      updateDatasetCommunityVisibilityError,
      updateDatasetCommunityVisibilityPending,
      updateDatasetCommunityVisibilitySuccess,
    } = this.props;
    const AllDatasetsLink = this.renderAllDatasetsLink;
    if (!userDataset)
      return (
        <NotFound>
          <AllDatasetsLink />
        </NotFound>
      );
    const isOwner = this.isMyDataset();

    return (
      <div className={classify()}>
        {this.getPageSections().map((Section, key) => (
          <Section key={key} />
        ))}
        {!isOwner || !sharingModalOpen ? null : (
          <SharingModal
            user={user}
            datasets={[userDataset]}
            onClose={this.closeSharingModal}
            shareUserDatasets={shareUserDatasets}
            context="datasetDetails"
            unshareUserDatasets={unshareUserDatasets}
            dataNoun={dataNoun}
            sharingDatasetPending={sharingDatasetPending}
            shareSuccessful={shareSuccessful}
            shareError={shareError}
            updateUserDatasetDetail={updateUserDatasetDetail}
            enablePublicUserDatasets={enablePublicUserDatasets}
          />
        )}
        {this.props.communityModalOpen && enablePublicUserDatasets ? (
          <CommunityModal
            user={user}
            datasets={[userDataset]}
            context="datasetDetails"
            onClose={() => updateCommunityModalVisibility(false)}
            dataNoun={dataNoun}
            updateDatasetCommunityVisibility={updateDatasetCommunityVisibility}
            updatePending={updateDatasetCommunityVisibilityPending}
            updateSuccessful={updateDatasetCommunityVisibilitySuccess}
            updateError={updateDatasetCommunityVisibilityError}
          />
        ) : null}
      </div>
    );
  }
}

UserDatasetDetail.contextType = WdkDependenciesContext;

export default UserDatasetDetail;
