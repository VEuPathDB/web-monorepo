import React, { ComponentType } from 'react';

import { connect } from 'react-redux';

import { add, keyBy } from 'lodash';

import { showLoginForm } from '@veupathdb/wdk-client/lib/Actions/UserSessionActions';
import PageController from '@veupathdb/wdk-client/lib/Core/Controllers/PageController';
import { Question } from '@veupathdb/wdk-client/lib/Utils/WdkModel';

import {
  loadUserDatasetDetail,
  removeUserDataset,
  shareUserDatasets,
  unshareUserDataset,
  updateUserDatasetDetail,
  updateSharingModalState,
  sharingError,
  sharingSuccess,
  updateCommunityModalVisibility,
  updateDatasetCommunityVisibility,
  loadVdiServiceMetadata
} from '../../Actions/UserDatasetsActions';


import { StateSlice } from '../../StoreModules/types';
import { DataNoun } from '../../Utils/types';
import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { DatasetFormConfigurators, DatasetTypeConfig } from '../../Common/Configuration';
import { History } from 'history';
import RnaSeqDatasetManagement from './RnaSeqDatasetManagement';
import BigwigDatasetManagement from './BigwigDatasetManagement';
import DatasetManagement, { DatasetEditModalProps, DatasetManagementProps } from './DatasetManagement';
import EmptyState from '../EmptyState';
import { EdaStudyLinks } from '../../Common/Configuration/DatasetWorkspaceConfig';
import EdaDatasetManagement from './EdaDatasetManagement';

const ActionCreators = {
  showLoginForm,
  loadUserDatasetDetail,
  updateUserDatasetDetail,
  removeUserDataset,
  shareUserDatasets,
  unshareUserDataset,
  updateSharingModalState,
  sharingError,
  sharingSuccess,
  updateCommunityModalVisibility,
  updateDatasetCommunityVisibility,
  loadVdiServiceMetadata
};

type StateProps = StateSlice['userDatasetDetail'] & StateSlice['globalData'];
type DispatchProps = typeof ActionCreators;
type OwnProps = {
  baseUrl: string;
  detailsPageTitle: string;
  workspaceTitle: string;
  id: string;
  detailComponentsByTypeName?: Record<string, ComponentType<DatasetManagementProps>>;
  dataNoun: DataNoun;
  enablePublicUserDatasets: boolean;
  includeAllLink: boolean;
  includeNameHeader: boolean;

  readonly history: History;

  readonly formConfigs?: DatasetFormConfigurators;
  readonly datasetTypes?: readonly DatasetTypeConfig[];
  readonly editModal?: DatasetEditModalProps;

  readonly fetchEdaStudyLinks: (wdkDatasetId: string) => EdaStudyLinks;
};

interface MergedProps {
  readonly ownProps: OwnProps;
  readonly dispatchProps: DispatchProps;
  readonly stateProps: StateProps;
}

/**
 * View Controller for a userDataset record.
 *
 * Note that we are accessing the userDataset from an object keyed by the
 * userDataset's id. This avoids race conditions that arise when ajax requests
 * complete in a different order than they were invoked.
 */
class DatasetManagementController extends PageController<MergedProps> {
  getQuestionUrl = (question: Question): string => {
    return `#${question.urlSegment}`;
  };

  getTitle() {
    const entry = this.props.stateProps.userDatasetDetails;
    if (entry && entry.resource) {
      return `${this.props.ownProps.detailsPageTitle} ${entry.resource.name}`;
    }
    if (entry && !entry.resource) {
      return `${this.props.ownProps.detailsPageTitle} not found`;
    }
    return `${this.props.ownProps.detailsPageTitle} ...`;
  }

  getActionCreators() {
    return ActionCreators;
  }

  loadData(prevProps?: MergedProps) {
    const { ownProps, stateProps } = this.props;

    if (stateProps.serviceMetadata == null) {
      console.log('loading vdi metadata');
      this.props.dispatchProps.loadVdiServiceMetadata();
    }

    if (prevProps == null) {
      if (
        stateProps.userDatasetDetails?.resource?.datasetId === ownProps.id
        && ownProps.editModal?.showModal
      ) {
        return;
      }
    }

    if (prevProps?.ownProps?.id !== ownProps.id) {
      console.log('loading dataset');
      this.props.dispatchProps.loadUserDatasetDetail(ownProps.id);
    }
  }

  isRenderDataLoadError() {
    const { loadError } = this.props.stateProps;
    return (
      loadError != null &&
      loadError.statusCode >= 400 &&
      loadError.statusCode !== 404
    );
  }

  isRenderDataNotFound(): boolean {
    const { loadError } = this.props.stateProps;
    return loadError != null && loadError.statusCode === 404;
  }

  isRenderDataPermissionDenied(): boolean {
    const { loadError } = this.props.stateProps;
    return (
      loadError != null &&
      (loadError.statusCode === 401 || loadError.statusCode === 403)
    );
  }

  isRenderDataLoaded() {
    const {
      userDatasetDetails: entry,
      user,
      questions,
      config
    } = this.props.stateProps;

    if (user && user.isGuest) return true;

    return !!(entry?.isLoading === false && user && questions && config);
  }

  getDetailView(type: any) {
    const name: string = type && typeof type === 'object' ? type.name : null;

    if (this.props.ownProps.detailComponentsByTypeName?.[name] != null) {
      return this.props.ownProps.detailComponentsByTypeName[name];
    }

    switch (name) {
      case 'bigwigs':
      case 'bigwigfiles':
        return BigwigDatasetManagement;
      case 'rnaseq':
        return RnaSeqDatasetManagement;
      case 'isasimple':
        return EdaDatasetManagement;
      default:
        return DatasetManagement;
    }
  }

  renderGuestView() {
    return (
      <EmptyState
        message={
          <button
            type="button"
            className="btn"
            onClick={() => this.props.dispatchProps.showLoginForm()}
          >
            Please log in to access {this.props.ownProps.workspaceTitle}.
          </button>
        }
      />
    );
  }

  renderView() {
    const {
      baseUrl,
      detailsPageTitle,
      workspaceTitle,
      dataNoun,
      enablePublicUserDatasets,
      includeAllLink,
      includeNameHeader
    } = this.props.ownProps;
    const {
      updateUserDatasetDetail,
      shareUserDatasets,
      removeUserDataset,
      unshareUserDataset,
      updateSharingModalState,
      sharingSuccess,
      sharingError,
      updateCommunityModalVisibility,
      updateDatasetCommunityVisibility
    } = this.props.dispatchProps;
    const {
      userDatasetDetails: entry,
      user,
      updateError,
      questions,
      config,
      userDatasetUpdating,
      sharingModalOpen,
      sharingDatasetPending,
      shareError,
      shareSuccessful,
      communityModalOpen,
      updateDatasetCommunityVisibilityError,
      updateDatasetCommunityVisibilityPending,
      updateDatasetCommunityVisibilitySuccess,
      serviceMetadata
    } = this.props.stateProps;

    if (!entry?.resource || !serviceMetadata) return <Loading />;

    const userDataset = entry.resource;

    const isOwner = !!(user && userDataset.owner.userId === user.id);

    const size =
      userDataset.files.upload?.contents
        ?.map((file) => file.fileSize)
        ?.reduce(add, 0) ?? 0;

    const props: DatasetManagementProps = {
      baseUrl,
      includeAllLink,
      includeNameHeader,
      user: user!,
      config: config!,
      isOwner,
      updateError,
      removeUserDataset,
      userDatasetUpdating,
      shareUserDatasets,
      unshareUserDatasets: unshareUserDataset,
      updateUserDatasetDetail,
      sharingModalOpen,
      sharingDatasetPending,
      sharingError,
      shareError,
      sharingSuccess,
      shareSuccessful,
      updateSharingModalState,
      userDataset: entry?.resource,
      getQuestionUrl: this.getQuestionUrl,
      questionMap: keyBy(questions, 'fullName'),
      workspaceTitle,
      detailsPageTitle,
      dataNoun,
      enablePublicUserDatasets,
      updateCommunityModalVisibility,
      updateDatasetCommunityVisibility,
      communityModalOpen,
      updateDatasetCommunityVisibilityError,
      updateDatasetCommunityVisibilityPending,
      updateDatasetCommunityVisibilitySuccess,
      datasetSize: size,
      vdiConfig: serviceMetadata,

      formConfigs: this.props.ownProps.formConfigs,
      datasetTypes: this.props.ownProps.datasetTypes,
      editModal: this.props.ownProps.editModal,

      history: this.props.ownProps.history,
      fetchEdaStudyLinks: this.props.ownProps.fetchEdaStudyLinks,
    };

    const DetailView = this.getDetailView(entry.resource.type);
    return entry.resource.visibility !== 'public' && user && user.isGuest ? (
      this.renderGuestView()
    ) : (
      <DetailView {...props} />
    );
  }
}

const enhance = connect<
  StateProps,
  DispatchProps,
  OwnProps,
  MergedProps,
  StateSlice
>(
  (state) => ({
    ...state.globalData,
    ...state.userDatasetDetail
  }),
  ActionCreators,
  (stateProps, dispatchProps, ownProps) => ({
    stateProps,
    dispatchProps,
    ownProps
  })
);

export default enhance(DatasetManagementController);
