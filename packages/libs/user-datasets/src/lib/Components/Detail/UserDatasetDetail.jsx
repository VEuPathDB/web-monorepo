import React from 'react';

import moment from 'moment';

import Icon from '@veupathdb/wdk-client/lib/Components/Icon/IconAlt';
import SaveableTextEditor from '@veupathdb/wdk-client/lib/Components/InputControls/SaveableTextEditor';
import Link from '@veupathdb/wdk-client/lib/Components/Link';
import {
  AnchoredTooltip,
  Mesa,
  MesaState,
} from '@veupathdb/wdk-client/lib/Components/Mesa';
import { WdkDependenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
import { bytesToHuman } from '@veupathdb/wdk-client/lib/Utils/Converters';

import NotFound from '@veupathdb/wdk-client/lib/Views/NotFound/NotFound';

import { isUserDatasetsCompatibleWdkService } from '../../Service/UserDatasetWrappers';

import SharingModal from '../Sharing/UserDatasetSharingModal';
import UserDatasetStatus from '../UserDatasetStatus';
import { makeClassifier, normalizePercentage } from '../UserDatasetUtils';

import './UserDatasetDetail.scss';

const classify = makeClassifier('UserDatasetDetail');

class UserDatasetDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = { sharingModalOpen: false };

    this.onMetaSave = this.onMetaSave.bind(this);
    this.isMyDataset = this.isMyDataset.bind(this);
    this.validateKey = this.validateKey.bind(this);
    this.handleDelete = this.handleDelete.bind(this);

    this.getAttributes = this.getAttributes.bind(this);
    this.renderAttributeList = this.renderAttributeList.bind(this);
    this.renderHeaderSection = this.renderHeaderSection.bind(this);
    this.renderDatasetActions = this.renderDatasetActions.bind(this);

    this.renderCompatibilitySection = this.renderCompatibilitySection.bind(
      this
    );
    this.getCompatibilityTableColumns = this.getCompatibilityTableColumns.bind(
      this
    );

    this.openSharingModal = this.openSharingModal.bind(this);
    this.renderFileSection = this.renderFileSection.bind(this);
    this.closeSharingModal = this.closeSharingModal.bind(this);
    this.getFileTableColumns = this.getFileTableColumns.bind(this);
    this.renderDetailsSection = this.renderDetailsSection.bind(this);
  }

  isMyDataset() {
    const { user, userDataset } = this.props;
    return (
      user && userDataset && user.id && user.id === userDataset.ownerUserId
    );
  }

  openSharingModal() {
    this.setState({ sharingModalOpen: true });
  }

  closeSharingModal() {
    this.setState({ sharingModalOpen: false });
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
    const { isOwner, userDataset, removeUserDataset } = this.props;
    const { sharedWith } = userDataset;
    const shareCount = !Array.isArray(sharedWith) ? null : sharedWith.length;
    const message =
      `Are you sure you want to ${
        isOwner ? 'delete' : 'remove'
      } this dataset? ` +
      (!isOwner || !shareCount
        ? ''
        : `${shareCount} collaborator${
            shareCount === 1 ? '' : 's'
          } you've shared with will lose access.`);

    if (window.confirm(message)) {
      removeUserDataset(userDataset, '/workspace/datasets');
    }
  }

  renderAllDatasetsLink() {
    return (
      <Link className="AllDatasetsLink" to={'/workspace/datasets'}>
        <Icon fa="chevron-left" />
        &nbsp; All My Data Sets
      </Link>
    );
  }

  getAttributes() {
    const { userDataset, quotaSize, questionMap } = this.props;
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
      questions,
      isInstalled,
    } = userDataset;
    const { display, name, version } = type;
    const isOwner = this.isMyDataset();

    return [
      {
        className: classify('Name'),
        attribute: 'My Dataset',
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
          />
        ),
      },
      {
        attribute: 'Owner',
        value: isOwner ? <span className="faded">Me</span> : owner,
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
      { attribute: 'ID', value: id },
      {
        attribute: 'Data Type',
        value: (
          <span>
            <b>{display}</b>{' '}
            <span className="faded">
              ({name} {version})
            </span>
          </span>
        ),
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
      // { attribute: 'Compatible Projects', value: projects.join(', ') },
      {
        attribute: 'Created',
        value: (
          <AnchoredTooltip content={moment(created).format()}>
            {moment(created).fromNow()}
          </AnchoredTooltip>
        ),
      },
      { attribute: 'Dataset Size', value: bytesToHuman(size) },
      !isOwner
        ? null
        : {
            attribute: 'Quota Usage',
            value: `${normalizePercentage(percentQuotaUsed)}% of ${bytesToHuman(
              quotaSize
            )}`,
          },
      !isOwner || !sharedWith || !sharedWith.length
        ? null
        : {
            attribute: 'Shared With',
            value: (
              <ul>
                {sharedWith.map((share) => (
                  <li key={share.email}>
                    {share.userDisplayName}{' '}
                    <span className="faded">&lt;{share.email}&gt;</span>{' '}
                    {moment(share.time).fromNow()}
                  </li>
                ))}
              </ul>
            ),
          },
      !questions || !questions.length || !isInstalled
        ? null
        : {
            attribute: 'Available Searches',
            value: (
              <ul>
                {questions.map((questionName) => {
                  const q = questionMap[questionName];
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
                    <li key={questionName}>
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
              classify('AttributeRow') + (className ? ' ' + className : '')
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
        <button className="btn btn-error" onClick={this.handleDelete}>
          {isOwner ? 'Delete' : 'Remove'}
          <Icon fa="trash" className="right-side" />
        </button>
        {!isOwner ? null : (
          <button className="btn btn-success" onClick={this.openSharingModal}>
            Share
            <Icon fa="share-alt" className="right-side" />
          </button>
        )}
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
    const { userDataset, appUrl } = this.props;
    const fileTableState = MesaState.create({
      columns: this.getFileTableColumns({ userDataset, appUrl }),
      rows: userDataset.datafiles,
    });

    return (
      <section id="dataset-files">
        <h1>Data Files</h1>
        <h3 className={classify('SectionTitle')}>
          <Icon fa="files-o" />
          Files in Dataset
        </h3>
        <Mesa state={fileTableState} />
      </section>
    );
  }

  getFileTableColumns() {
    const { userDataset } = this.props;
    const { id } = userDataset;
    const { wdkService } = this.context;

    return [
      {
        key: 'name',
        name: 'File Name',
        renderCell({ row }) {
          const { name } = row;
          return <code>{name}</code>;
        },
      },
      {
        key: 'size',
        name: 'File Size',
        renderCell({ row }) {
          const { size } = row;
          return bytesToHuman(size);
        },
      },
      {
        key: 'download',
        name: 'Download',
        width: '130px',
        headingStyle: { textAlign: 'center' },
        renderCell({ row }) {
          const { name } = row;

          const downloadUrl = !isUserDatasetsCompatibleWdkService(wdkService)
            ? undefined
            : wdkService.getUserDatasetDownloadUrl(id, name);

          const downloadAvailable = downloadUrl != null;

          return (
            <a
              href={downloadUrl}
              target="_blank"
              rel="noreferrer"
              title="Download this file"
            >
              <button
                className="btn btn-info"
                disabled={!downloadAvailable}
                title={
                  downloadAvailable
                    ? undefined
                    : 'This download is unavailable. Please contact us if this problem persists.'
                }
              >
                <Icon fa="save" className="left-side" /> Download
              </button>
            </a>
          );
        },
      },
    ].filter((column) => column);
  }

  /* -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

                                Compatible Table

   -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */

  renderCompatibilitySection() {
    const { userDataset, config } = this.props;
    const { projectId, displayName } = config;

    const compatibilityTableState = MesaState.create({
      columns: this.getCompatibilityTableColumns(userDataset),
      rows: userDataset.dependencies,
    });

    const { buildNumber } = config;
    const { isCompatible } = userDataset;
    const isCompatibleProject = userDataset.projects.includes(projectId);

    return (
      <section id="dataset-compatibility">
        <h1>Use This Dataset in {displayName}</h1>
        <h3 className={classify('SectionTitle')}>
          <Icon fa="puzzle-piece" />
          Compatibility Information &nbsp;
          <AnchoredTooltip content="The data and genomes listed here are requisite for using the data in this user dataset.">
            <div className="HelpTrigger">
              <Icon fa="question-circle" />
            </div>
          </AnchoredTooltip>
        </h3>
        <div style={{ maxWidth: '600px' }}>
          <Mesa state={compatibilityTableState} />
        </div>
        {isCompatibleProject && isCompatible ? (
          <p className="success">
            This dataset is compatible with the current release, build{' '}
            {buildNumber}, of <b>{projectId}</b>. It is installed for use.
          </p>
        ) : (
          <p className="danger">
            This dataset is not compatible with the current release, build{' '}
            {buildNumber}, of <b>{projectId}</b>. It is not installed for use.
          </p>
        )}
      </section>
    );
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
      },
      {
        key: 'installedVersion',
        name: 'Installed Resource Release',
        renderCell({ row }) {
          const { compatibilityInfo } = row;
          const { currentBuild } = compatibilityInfo ? compatibilityInfo : {};
          return compatibilityInfo === null || currentBuild === null
            ? 'N/A'
            : currentBuild;
        },
      },
    ];
  }

  /* -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

                                General Rendering

   -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */

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
    } = this.props;
    const AllDatasetsLink = this.renderAllDatasetsLink;
    if (!userDataset)
      return (
        <NotFound>
          <AllDatasetsLink />
        </NotFound>
      );
    const isOwner = this.isMyDataset();
    const { sharingModalOpen } = this.state;
    //    console.info('UDDC gettin props', this.props);
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
            unshareUserDatasets={unshareUserDatasets}
          />
        )}
      </div>
    );
  }
}

UserDatasetDetail.contextType = WdkDependenciesContext;

export default UserDatasetDetail;
