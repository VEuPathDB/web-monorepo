import React from 'react';
import { Public } from '@material-ui/icons';

import Icon from '@veupathdb/wdk-client/lib/Components/Icon/IconAlt';
import SaveableTextEditor from '@veupathdb/wdk-client/lib/Components/InputControls/SaveableTextEditor';
import Link from '@veupathdb/wdk-client/lib/Components/Link';
import { Mesa, MesaState } from '@veupathdb/coreui/lib/components/Mesa';
import {
  WdkDependencies,
  WdkDependenciesContext,
} from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
import { bytesToHuman } from '@veupathdb/wdk-client/lib/Utils/Converters';

import NotFound from '@veupathdb/wdk-client/lib/Views/NotFound/NotFound';

import SharingModal from '../Sharing/UserDatasetSharingModal';
import CommunityModal from '../Sharing/UserDatasetCommunityModal';
import UserDatasetStatus from '../UserDatasetStatus';
import { makeClassifier } from '../UserDatasetUtils';
import { ThemedGrantAccessButton } from '../ThemedGrantAccessButton';
import { ThemedDeleteButton } from '../ThemedDeleteButton';

import { DateTime } from '../DateTime';

import '../UserDatasets.scss';
import './UserDatasetDetail.scss';
import { datasetUserFullName } from '../../Utils/formatting';
import { User } from '@veupathdb/wdk-client/lib/Utils/WdkUser';
import { FetchClientError } from '@veupathdb/http-utils';
import {
  removeUserDataset,
  shareUserDatasets,
  sharingError,
  sharingSuccess,
  unshareUserDatasets,
  updateCommunityModalVisibility,
  updateDatasetCommunityVisibility,
  updateSharingModalState,
  updateUserDatasetDetail,
} from '../../Actions/UserDatasetsActions';
import {
  DataNoun,
  DatasetDetails,
  DatasetShareOffer,
  ZipFileType,
} from '../../Utils/types';
import { Question } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { ServiceConfig } from '@veupathdb/wdk-client/lib/Service/ServiceBase';
import {
  MesaColumn,
  MesaStateProps,
} from '@veupathdb/coreui/lib/components/Mesa/types';
import { isVdiCompatibleWdkService } from '../../Service';

const classify = makeClassifier('UserDatasetDetail');

export interface DetailViewProps {
  baseUrl: string;
  includeAllLink: boolean;
  includeNameHeader: boolean;
  user: User;
  config: ServiceConfig;
  isOwner: boolean;
  location: Location;
  updateError?: FetchClientError;
  removeUserDataset: typeof removeUserDataset;
  quotaSize: number;
  userDatasetUpdating: boolean;
  shareUserDatasets: typeof shareUserDatasets;
  unshareUserDatasets: typeof unshareUserDatasets;
  updateUserDatasetDetail: typeof updateUserDatasetDetail;
  sharingModalOpen: boolean;
  sharingDatasetPending: boolean;
  sharingError: typeof sharingError;
  shareError?: Error;
  sharingSuccess: typeof sharingSuccess;
  shareSuccessful?: boolean;
  userDataset: DatasetDetails;
  getQuestionUrl: (q: Question) => string;
  questionMap: Record<string, Question>;
  workspaceTitle: string;
  detailsPageTitle: string;
  dataNoun: DataNoun;
  enablePublicUserDatasets: boolean;
  updateCommunityModalVisibility: typeof updateCommunityModalVisibility;
  updateDatasetCommunityVisibility: typeof updateDatasetCommunityVisibility;
  updateSharingModalState: typeof updateSharingModalState;
  communityModalOpen: boolean;
  updateDatasetCommunityVisibilityError?: string;
  updateDatasetCommunityVisibilityPending: boolean;
  updateDatasetCommunityVisibilitySuccess: boolean;
  datasetSize: number;
}

export interface DatasetAttribute {
  attribute: string;
  className?: string;
  value: React.ReactNode;
}

interface ZipFileRow {
  name: string;
  size: number;
  download?: React.ReactNode;
}

class UserDatasetDetail extends React.Component<DetailViewProps> {
  constructor(props: DetailViewProps) {
    super(props);

    this.onMetaSave = this.onMetaSave.bind(this);
    this.validateKey = this.validateKey.bind(this);
    this.handleDelete = this.handleDelete.bind(this);

    this.getAttributes = this.getAttributes.bind(this);
    this.renderAttributeList = this.renderAttributeList.bind(this);
    this.renderHeaderSection = this.renderHeaderSection.bind(this);
    this.renderDatasetActions = this.renderDatasetActions.bind(this);

    this.openSharingModal = this.openSharingModal.bind(this);
    this.renderFileSection = this.renderFileSection.bind(this);
    this.closeSharingModal = this.closeSharingModal.bind(this);
    this.getFileTableColumns = this.getFileTableColumns.bind(this);
    this.renderDetailsSection = this.renderDetailsSection.bind(this);
    this.renderAllDatasetsLink = this.renderAllDatasetsLink.bind(this);
  }

  openSharingModal() {
    this.props.sharingSuccess(undefined);
    this.props.sharingError(undefined);
    this.props.updateSharingModalState(true);
  }

  closeSharingModal() {
    this.props.updateSharingModalState(false);
  }

  validateKey(key: string): key is keyof DatasetDetails {
    const META_KEYS = [
      'name',
      'summary',
      'description',
      'publications',
      'contacts',
      'hyperlinks',
      'organisms',
    ];

    return META_KEYS.includes(key);
  }

  // Sets values within the meta object.
  // There are multiple types of metadata fields.
  // First, the easy key-value example. this.onMetaSave('name')('my new name');
  // Second, for fields that are arrays of objects, like meta.publications[index].name, specify the nestedKey and index. this.onMetaSave('publications', 'pubMedId', 0)('new pubMedId value');
  // Third, for arrays of strings, like meta.organisms[index], just specify the index. this.onMetaSave('organisms', undefined, 0)('new organism value');
  //
  // NOTE: Currently only simple key-value updates (case 1) are used. The complex nested array
  // cases were possibly removed when publications/contacts fields were temporarily removed from the UI?
  // If these complex cases are needed again, consider using monocle-ts lenses for type-safe
  // nested updates instead of manual array manipulation with type casts.
  // See packages/libs/eda/src/lib/core/hooks/analysis.ts for existing lens usage examples.
  onMetaSave(key: string, nestedKey?: string, index?: number) {
    if (!this.validateKey(key))
      throw new TypeError(`Can't edit meta for invalid key: ${key}`);

    return (value: string) => {
      if (index && !Number.isInteger(index)) {
        throw new TypeError(
          `onMetaSave: expected index to be an integer; got ${typeof index} with value ${index}`
        );
      }

      const { userDataset, updateUserDatasetDetail } = this.props;

      let updatedMeta;

      if (index !== undefined && Number.isInteger(index) && index >= 0) {
        // Handle nested array case, for example meta.contacts[index].name
        let arrayField = [...(userDataset[key] as any[])];
        const arrayLength = arrayField.length ?? 0;
        if (index <= arrayLength - 1) {
          if (nestedKey !== undefined) {
            // Update the nested key at the correct index in the array of objects.
            // Example: meta.contacts
            arrayField[index][nestedKey] = value;
          } else {
            // With no nestedKey, just set the value directly on the array.
            // Example: meta.organisms
            arrayField[index] = value;
          }
          updatedMeta = { [key]: arrayField };
        } else {
          // Add new entry to the array
          // We use this case to add new empty objects to the array.
          arrayField.push(value);
          updatedMeta = { [key]: arrayField };
        }
      } else {
        // Regular key-value update.
        updatedMeta = { [key]: value };
      }

      return updateUserDatasetDetail(userDataset, updatedMeta);
    };
  }

  handleDelete() {
    const { baseUrl, isOwner, userDataset, removeUserDataset, dataNoun } =
      this.props;
    const { shares } = userDataset;
    const shareCount = !Array.isArray(shares) ? null : shares.length;

    const question = `Are you sure you want to ${
      isOwner ? 'delete' : 'remove'
    } this ${dataNoun.singular.toLowerCase()}? `;

    const visibilityMessage =
      userDataset.visibility === 'public'
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
      removeUserDataset(userDataset.datasetId, baseUrl);
    }
  }

  renderAllDatasetsLink() {
    if (!this.props.includeAllLink) return null;
    return (
      <Link className="AllDatasetsLink" to={this.props.baseUrl}>
        <Icon fa="chevron-left" />
        &nbsp; All {this.props.workspaceTitle}
      </Link>
    );
  }

  isInstalled() {
    const { config } = this.props;
    const { status } = this.props.userDataset;
    return (
      status?.import?.status === 'complete' &&
      status?.install?.find((d) => d.installTarget === config.projectId)?.data
        ?.status === 'complete'
    );
  }

  getGrantedShares(): DatasetShareOffer[] {
    return (
      this.props.userDataset.shares?.filter((it) => it.status === 'grant') ?? []
    );
  }

  getAttributes(): DatasetAttribute[] {
    const { userDataset, isOwner, questionMap, dataNoun } = this.props;
    const { onMetaSave } = this;
    const isInstalled = this.isInstalled();
    const questions = Object.values(questionMap).filter(
      (q) =>
        q.properties !== undefined &&
        'userDatasetType' in q.properties &&
        q.properties.userDatasetType.includes(userDataset.type.name)
    );

    const shares = this.getGrantedShares();

    return (
      [
        this.props.includeNameHeader
          ? {
              attribute: this.props.detailsPageTitle,
              className: classify('Name'),
              value: (
                <SaveableTextEditor
                  value={userDataset.name}
                  readOnly={!isOwner}
                  onSave={this.onMetaSave('name')}
                />
              ),
            }
          : null,
        {
          attribute: 'Status',
          value: (
            <UserDatasetStatus
              baseUrl={this.props.baseUrl}
              linkToDataset={false}
              useTooltip={false}
              userDataset={userDataset}
              projectId={this.props.config.projectId}
              displayName={this.props.config.displayName}
              dataNoun={dataNoun}
            />
          ),
        },
        !Array.isArray(questions) || !questions.length || !isInstalled
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
                      (ps.length === 1
                        ? '?param.' + ps[0] + '=' + userDataset.datasetId
                        : '');
                    return (
                      <li key={q.fullName}>
                        <Link to={url}>{q.displayName}</Link>
                      </li>
                    );
                  })}
                </ul>
              ),
            },
        {
          attribute: 'Owner',
          value: isOwner ? 'Me' : datasetUserFullName(userDataset.owner),
        },
        {
          attribute: 'Visibility',
          value:
            userDataset.visibility === 'public' ? (
              <>
                {' '}
                <Public className="Community-visible" /> This is a "Community{' '}
                {dataNoun.singular}" made accessible to the public by user{' '}
                {datasetUserFullName(userDataset.owner)}.
              </>
            ) : (
              <>
                This {dataNoun.singular.toLowerCase()} is only visible to the
                owner and those they have shared it with.
              </>
            ),
        },
        !isOwner || !shares.length
          ? null
          : {
              attribute: 'Shared with',
              className: classify('SharedWith'),
              value: (
                <ul>
                  {shares.map((share, index) => (
                    <li key={`${share.recipient.userId}}-${index}`}>
                      {datasetUserFullName(share.recipient)}
                    </li>
                  ))}
                </ul>
              ),
            },
        {
          attribute: 'Summary',
          value: (
            <SaveableTextEditor
              multiLine={true}
              value={userDataset.summary}
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
              value={userDataset.description ?? ''}
              multiLine={true}
              readOnly={!isOwner}
              onSave={this.onMetaSave('description')}
              emptyText="No Description"
            />
          ),
        },
        {
          attribute: 'Created',
          value: <DateTime datetime={userDataset.created} />,
        },
        {
          attribute: 'Data set size',
          value: bytesToHuman(this.props.datasetSize),
        },
        { attribute: 'ID', value: userDataset.datasetId },
        {
          attribute: 'Data type',
          value: (
            <span>
              {userDataset.type.category} ({userDataset.type.name}{' '}
              {userDataset.type.version})
            </span>
          ),
        },
      ] as Array<DatasetAttribute | null>
    ).filter((attr): attr is DatasetAttribute => !!attr);
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
        {attributes.map(({ attribute, value, className }) => (
          <div
            className={
              classify('AttributeRow') +
              ' ' +
              (className ?? classify(attribute))
            }
            key={attribute}
          >
            <div className={classify('AttributeName')}>
              <strong>{attribute}:</strong>
            </div>
            <div className={classify('AttributeValue')}>{value}</div>
          </div>
        ))}
      </div>
    );
  }

  renderDatasetActions() {
    const { isOwner } = this.props;
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
    const { files: fileListing } = userDataset;
    const uploadZipFileState: MesaStateProps<ZipFileRow> = MesaState.create({
      columns: this.getFileTableColumns('upload'),
      rows: [{ name: 'upload.zip', size: fileListing?.upload?.zipSize }],
    });
    const processedZipFileState: MesaStateProps<ZipFileRow> = MesaState.create({
      columns: this.getFileTableColumns('install'),
      rows: [{ name: 'install.zip', size: fileListing?.install?.zipSize }],
    });

    return (
      <section id="dataset-files">
        <h2>Data Files</h2>
        <h3>
          <Icon fa="files-o" />
          Uploaded Files in {dataNoun.singular}
        </h3>
        <Mesa state={uploadZipFileState} />
        <h3>
          <Icon fa="files-o" />
          Processed Files in {dataNoun.singular}
        </h3>
        <Mesa state={processedZipFileState} />
      </section>
    );
  }

  getFileTableColumns(fileType: ZipFileType): MesaColumn<ZipFileRow>[] {
    const { userDataset, config } = this.props;
    const { projectId } = config;
    const { status } = userDataset;
    const { wdkService } = this.context! as WdkDependencies;

    const fileListElement = userDataset.files[fileType]?.contents?.length && (
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
          {userDataset.files[fileType]!.contents.map((file, index) => (
            <li key={`${file.fileName}-${index}`}>
              {file.fileName} <span>({bytesToHuman(file.fileSize)})</span>
            </li>
          ))}
        </ol>
      </details>
    );

    const columns: Array<MesaColumn<ZipFileRow> | null> = [
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
              : status.install?.find((d) => d.installTarget === projectId)?.data
                  ?.status === 'complete';

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
                if (isVdiCompatibleWdkService(wdkService))
                  wdkService.getUserDatasetFiles(
                    userDataset.datasetId,
                    fileType
                  );
              }}
            >
              <Icon fa="save" className="left-side" /> Download
            </button>
          );
        },
      },
    ];

    return columns.filter(
      (column): column is MesaColumn<ZipFileRow> => !!column
    );
  }

  /* -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

                                General Rendering

   -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */

  // Explicit return type is required for two reasons:
  // 1. JSX component constraint: These functions are used as JSX components (<Section />),
  //    which must return ReactElement | null (not the broader ReactNode type that includes
  //    undefined, string, number, etc.).
  // 2. Hybrid JS/TS compatibility: JavaScript subclasses (like BigwigDatasetDetail.jsx)
  //    generate .d.ts files from JSDoc annotations. Without an explicit type here,
  //    TypeScript's inference can conflict with JSDoc-generated types during compilation.
  // Subclasses may return sections that are conditionally rendered (null).
  getPageSections(): Array<() => React.ReactElement | null> {
    return [this.renderHeaderSection, this.renderFileSection];
  }

  render() {
    const {
      user,
      userDataset,
      shareUserDatasets,
      unshareUserDatasets,
      dataNoun,
      isOwner,
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
