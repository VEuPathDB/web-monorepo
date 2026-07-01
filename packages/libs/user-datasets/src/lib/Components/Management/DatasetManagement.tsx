import React, { ReactNode } from 'react';

import { Public } from '@material-ui/icons';

import Icon from '@veupathdb/wdk-client/lib/Components/Icon/IconAlt';
import Link from '@veupathdb/wdk-client/lib/Components/Link';
import {
  WdkDependenciesContext,
} from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';

import NotFound from '@veupathdb/wdk-client/lib/Views/NotFound/NotFound';

import SharingModal from '../Sharing/UserDatasetSharingModal';
import CommunityModal from '../Sharing/UserDatasetCommunityModal';
import UserDatasetStatus from '../UserDatasetStatus';
import { makeClassifier } from '../UserDatasetUtils';
import { ThemedGrantAccessButton } from '../ThemedGrantAccessButton';
import { ThemedDeleteButton } from '../ThemedDeleteButton';
import { UserDatasetFiles } from '../UserDatasetFiles';

import { DateTime } from '../DateTime';

import '../UserDatasets.scss';
import './DatasetManagement.scss';
import { datasetUserFullName, formatFileSize } from '../../Utils/formatting';
import { User } from '@veupathdb/wdk-client/lib/Utils/WdkUser';
import { FetchClientError } from '@veupathdb/http-utils';
import {
  removeUserDataset,
  shareUserDatasets,
  sharingError,
  sharingSuccess,
  unshareUserDataset,
  updateCommunityModalVisibility,
  updateDatasetCommunityVisibility,
  updateSharingModalState,
  updateUserDatasetDetail,
} from '../../Actions/UserDatasetsActions';
import { DataNoun } from '../../Utils/types';
import {
  DatasetGetResponseBody,
  DatasetShareOffer,
  VdiServiceMetadata
} from '../../Service';
import { Question } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { ServiceConfig } from '@veupathdb/wdk-client/lib/Service/ServiceBase';

// needed for eda searches, to covert vdi ID to wdk ID
import { diyUserDatasetIdToWdkRecordId } from '../../Utils/diyDatasets';
import { CommunityPromotionError } from '../Sharing/CommunityPromotionError';
import { UpdateFormController } from '../Update/UpdateFormController';
import { DatasetFormConfigurators, DatasetTypeConfig, findDatasetTypeConfig } from '../../Common/Configuration';
import { isEmpty } from 'lodash';
import { History } from 'history';
import { EdaStudyLinks } from '../../Common/Configuration/DatasetWorkspaceConfig';

const classify = makeClassifier('DatasetManagement');

export interface DatasetManagementProps {
  baseUrl: string;
  includeAllLink: boolean;
  includeNameHeader: boolean;
  readonly vdiConfig: VdiServiceMetadata;
  user: User;
  config: ServiceConfig;
  isOwner: boolean;
  updateError?: FetchClientError;
  removeUserDataset: typeof removeUserDataset;
  userDatasetUpdating: boolean;
  shareUserDatasets: typeof shareUserDatasets;
  unshareUserDatasets: typeof unshareUserDataset;
  updateUserDatasetDetail: typeof updateUserDatasetDetail;
  sharingModalOpen: boolean;
  sharingDatasetPending: boolean;
  sharingError: typeof sharingError;
  shareError?: Error;
  sharingSuccess: typeof sharingSuccess;
  shareSuccessful?: boolean;
  userDataset: DatasetGetResponseBody;
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
  updateDatasetCommunityVisibilityError?: CommunityPromotionError;
  updateDatasetCommunityVisibilityPending: boolean;
  updateDatasetCommunityVisibilitySuccess: boolean;
  datasetSize: number;

  /**
   * When the management page is viewed by the dataset uploader, this value will
   * be present to enable the dataset update form.
   */
  readonly formConfigs?: DatasetFormConfigurators;

  /**
   * When the management page is viewed by the dataset uploader, this value will
   * be present to enable the dataset update form.
   */
  readonly datasetTypes?: readonly DatasetTypeConfig[];

  /**
   * Whether the dataset update form modal should be rendered.
   */
  readonly editModal?: DatasetEditModalProps;

  readonly history: History;

  readonly fetchEdaStudyLinks: (wdkDatasetId: string) => EdaStudyLinks;
}

export interface DatasetEditModalProps {
  readonly showModal: boolean;
  readonly updateToPublic: boolean;
}

export interface DatasetAttribute {
  attribute: string;
  className?: string;
  value: React.ReactNode;
}

enum DatasetUpdateAction {
  None,
  OpeningDefault,
  OpeningForPromotion,
  Closing,
}

export interface DatasetManagementState {
  readonly datasetUpdateAction: DatasetUpdateAction;
  readonly isCommunityModalOpen: boolean;
}

class DatasetManagement<S extends DatasetManagementState = DatasetManagementState>
  extends React.Component<DatasetManagementProps, S>
{
  constructor(props: DatasetManagementProps) {
    super(props);

    this.state = {
      ...this.state,
      datasetUpdateAction: DatasetUpdateAction.None,
      isCommunityModalOpen: props.communityModalOpen,
    };

    this.handleDelete = this.handleDelete.bind(this);

    this.getAttributes = this.getAttributes.bind(this);
    this.renderAttributeList = this.renderAttributeList.bind(this);
    this.renderHeaderSection = this.renderHeaderSection.bind(this);
    this.renderDatasetActions = this.renderDatasetActions.bind(this);

    this.openSharingModal = this.openSharingModal.bind(this);
    this.renderFileSection = this.renderFileSection.bind(this);
    this.closeSharingModal = this.closeSharingModal.bind(this);
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
        &nbsp; Manage {this.props.workspaceTitle}
      </Link>
    );
  }

  isInstalled() {
    const { config } = this.props;
    const { status } = this.props.userDataset;
    return (
      status?.import?.status === 'complete' &&
      status?.install?.some(
        (d) =>
          d.installTarget === config.projectId &&
          d.data?.status === 'complete' &&
          (d.meta == null || d.meta.status === 'complete')
      )
    );
  }

  getGrantedShares(): DatasetShareOffer[] {
    return (
      this.props.userDataset.shares?.filter((it) => it.status === 'grant') ?? []
    );
  }

  getAttributes(): DatasetAttribute[] {
    const { userDataset, isOwner, questionMap, dataNoun } = this.props;
    const isInstalled = this.isInstalled();
    const questions = Object.values(questionMap).filter(
      (q) =>
        q.properties !== undefined &&
        'userDatasetType' in q.properties &&
        q.properties.userDatasetType.includes(userDataset.type.name)
    );

    const setState = this.setState.bind(this);

    const shares = this.getGrantedShares();

    const editable = !isEmpty(this.props.datasetTypes)
      && !isEmpty(findDatasetTypeConfig(userDataset.type,  this.props.datasetTypes!));

    return (
      [
        this.props.includeNameHeader
          ? {
              attribute: this.props.detailsPageTitle,
              className: classify('Name'),
              value: <>
                {userDataset.name}
                {editable && isOwner && (
                  <button
                    type="button"
                    title="Edit Dataset"
                    onClick={() => setState((s) => ({
                      ...s,
                      datasetUpdateAction: DatasetUpdateAction.OpeningDefault
                    }))}
                  >
                    <Icon fa="pencil edit"/>
                  </button>
                )}
              </>,
            }
          : null,
        {
          attribute: 'Status',
          value: (
            <UserDatasetStatus
              vdiConfig={this.props.vdiConfig.configuration}
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
                    // 'geneListUserDataset' for genelists,  hence the regex: /ataset/
                    const ps = q.paramNames.filter((paramName) =>
                      paramName.match(/ataset/)
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
                        ? '?param.' + ps[0] + '=' +
                          (userDataset.type.name === 'phenotype'
                            ? diyUserDatasetIdToWdkRecordId(userDataset.datasetId)
                            : userDataset.datasetId
                          ) +
                          (userDataset.type.name === 'genelist'
                            ? '&autoRun'
                            : ''
                          )

                        : ''
                      );

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
          attribute: 'Uploaded by',
          value: isOwner ? 'Me' : datasetUserFullName(userDataset.owner),
        },
        {
          attribute: 'Visibility',
          value:
            userDataset.visibility === 'public' ? (
              <>
                {' '}
                <Public className="Community-visible" /> This is a "Public{' '}
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
        {
          attribute: 'Site search status',
          value:
            userDataset.visibility === 'public'
              ? 'enabled for public datasets'
              : 'disabled for private datasets',
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
          value: userDataset.summary,
        },
        {
          attribute: 'Description',
          value: userDataset.description ?? '',
        },
        {
          attribute: 'Created',
          value: <DateTime datetime={userDataset.created} />,
        },
        {
          attribute: 'Data set size',
          value: formatFileSize(this.props.datasetSize),
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

    const notInstalledMessage = this.isInstalled()
      ? undefined
      : 'Datasets that have not been installed cannot be made public.'

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
            disableCommunityReason={notInstalledMessage}
            communityDatasetsEnabled={this.props.enablePublicUserDatasets}
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
    const { userDataset } = this.props;

    return <UserDatasetFiles
      datasetId={userDataset.datasetId}
      dataset={userDataset}
    />;
  }

  /* -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

                                General Rendering

   -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */

  // Explicit return type is required for two reasons:
  // 1. JSX component constraint: These functions are used as JSX components (<Section />),
  //    which must return ReactElement | null (not the broader ReactNode type that includes
  //    undefined, string, number, etc.).
  // 2. Hybrid JS/TS compatibility: JavaScript subclasses (like BigwigDatasetDetail.tsx)
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

    const modal: ReactNode = (function(self: DatasetManagement) {
      if (!isOwner)
        return null;

      if (sharingModalOpen) {
        return <SharingModal
          user={user}
          dataset={userDataset}
          onClose={self.closeSharingModal}
          shareUserDatasets={shareUserDatasets}
          context="datasetDetails"
          unshareUserDataset={unshareUserDatasets}
          dataNoun={dataNoun}
          sharingDatasetPending={sharingDatasetPending}
          shareSuccessful={shareSuccessful}
          shareError={shareError}
          updateUserDatasetDetail={updateUserDatasetDetail}
        />;
      }

      if (self.state.isCommunityModalOpen && enablePublicUserDatasets) {
        return <CommunityModal
          user={user}
          datasets={[ userDataset ]}
          context="datasetDetails"
          onClose={() => updateCommunityModalVisibility(false)}
          dataNoun={dataNoun}
          updateDatasetCommunityVisibility={
            (datasetIds, isVisibleToCommunity, context) => {
              self.setState((s) => ({
                ...s,
                datasetUpdateAction: DatasetUpdateAction.OpeningDefault,
                isCommunityModalOpen: false
              }));

              return updateDatasetCommunityVisibility(
                datasetIds,
                isVisibleToCommunity,
                context
              );
            }
          }
          updatePending={updateDatasetCommunityVisibilityPending}
          updateSuccessful={updateDatasetCommunityVisibilitySuccess}
          updateError={updateDatasetCommunityVisibilityError}
        />;
      }

      const updatePath = `${self.props.baseUrl}/${userDataset.datasetId}/edit`;

      switch (self.state.datasetUpdateAction) {
        case DatasetUpdateAction.OpeningForPromotion:
          self.props.history.push({
            pathname: updatePath,
            search: "?updateToPublic",
          });
          break;

        case DatasetUpdateAction.OpeningDefault:
          self.props.history.push({ pathname: updatePath });
          break;

        case DatasetUpdateAction.Closing:
          self.props.history.goBack();
          break;
      }

      if (self.props.editModal?.showModal) {
        return <UpdateFormController
          datasetId={userDataset.datasetId}
          closeModal={() => self.setState(s => ({
            ...s,
            datasetUpdateAction: DatasetUpdateAction.Closing
          }))}
          baseUrl={self.props.baseUrl}
          vdiConfig={self.props.vdiConfig}
          isPromotingToPublic={self.props.editModal.updateToPublic}
          formConfigs={self.props.formConfigs!}
          datasetTypes={self.props.datasetTypes!}
        />;
      }

      return null;
    })(this);

    return (
      <div className={classify()}>
        {this.getPageSections().map((Section, key) => (
          <Section key={key} />
        ))}
        {modal}
      </div>
    );
  }
}

DatasetManagement.contextType = WdkDependenciesContext;

export default DatasetManagement;
