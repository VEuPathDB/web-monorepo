import { ComponentType } from 'react';

import { connect } from 'react-redux';

import { keyBy } from 'lodash';

import { showLoginForm } from '@veupathdb/wdk-client/lib/Actions/UserSessionActions';
import PageController from '@veupathdb/wdk-client/lib/Core/Controllers/PageController';
import { Question } from '@veupathdb/wdk-client/lib/Utils/WdkModel';

import {
  loadUserDatasetDetail,
  removeUserDataset,
  shareUserDatasets,
  unshareUserDatasets,
  updateUserDatasetDetail,
  updateSharingModalState,
  sharingError,
  sharingSuccess,
  updateCommunityModalVisibility,
  updateDatasetCommunityVisibility,
} from '../Actions/UserDatasetsActions';

import BigwigDatasetDetail from '../Components/Detail/BigwigDatasetDetail';
import RnaSeqDatasetDetail from '../Components/Detail/RnaSeqDatasetDetail';
import UserDatasetDetail from '../Components/Detail/UserDatasetDetail';
import EmptyState from '../Components/EmptyState';
import { quotaSize } from '../Components/UserDatasetUtils';

import { StateSlice } from '../StoreModules/types';
import { DataNoun } from '../Utils/types';

const ActionCreators = {
  showLoginForm,
  loadUserDatasetDetail,
  updateUserDatasetDetail,
  removeUserDataset,
  shareUserDatasets,
  unshareUserDatasets,
  updateSharingModalState,
  sharingError,
  sharingSuccess,
  updateCommunityModalVisibility,
  updateDatasetCommunityVisibility,
};

export type UserDatasetDetailProps = any;

type StateProps = StateSlice['userDatasetDetail'] & StateSlice['globalData'];
type DispatchProps = typeof ActionCreators;
type OwnProps = {
  baseUrl: string;
  detailsPageTitle: string;
  workspaceTitle: string;
  id: string;
  detailComponentsByTypeName?: Record<
    string,
    ComponentType<UserDatasetDetailProps>
  >;
  dataNoun: DataNoun;
  enablePublicUserDatasets: boolean;
  includeAllLink: boolean;
  includeNameHeader: boolean;
};
type MergedProps = {
  ownProps: OwnProps;
  dispatchProps: DispatchProps;
  stateProps: StateProps;
};

/**
 * View Controller for a userDataset record.
 *
 * Note that we are accessing the userDataset from an object keyed by the
 * userDataset's id. This avoids race conditions that arise when ajax requests
 * complete in a different order than they were invoked.
 */
class UserDatasetDetailController extends PageController<MergedProps> {
  getQuestionUrl = (question: Question): string => {
    return `#${question.urlSegment}`;
  };

  getTitle() {
    const entry =
      this.props.stateProps.userDatasetsById[this.props.ownProps.id];
    if (entry && entry.resource) {
      return `${this.props.ownProps.detailsPageTitle} ${entry.resource.meta.name}`;
    }
    if (entry && !entry.resource) {
      return `${this.props.ownProps.detailsPageTitle} not found`;
    }
    return `${this.props.ownProps.detailsPageTitle} ...`;
  }

  getActionCreators() {
    return ActionCreators;
  }

  loadData(prevProps?: this['props']) {
    const idChanged =
      prevProps == null || prevProps.ownProps.id !== this.props.ownProps.id;
    if (idChanged) {
      this.props.dispatchProps.loadUserDatasetDetail(this.props.ownProps.id);
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
    const { id } = this.props.ownProps;
    const { userDatasetsById, user, questions, config } = this.props.stateProps;
    const entry = userDatasetsById[id];
    if (user && user.isGuest) return true;
    return entry && !entry.isLoading && user && questions && config
      ? true
      : false;
  }

  getDetailView(type: any) {
    const name: string = type && typeof type === 'object' ? type.name : null;

    if (this.props.ownProps.detailComponentsByTypeName?.[name] != null) {
      return this.props.ownProps.detailComponentsByTypeName[name];
    }

    switch (name) {
      case 'bigwigs':
      case 'bigwigfiles':
        return BigwigDatasetDetail;
      case 'rnaseq':
        return RnaSeqDatasetDetail;
      default:
        return UserDatasetDetail;
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
      id,
      workspaceTitle,
      dataNoun,
      enablePublicUserDatasets,
      includeAllLink,
      includeNameHeader,
    } = this.props.ownProps;
    const {
      updateUserDatasetDetail,
      shareUserDatasets,
      removeUserDataset,
      unshareUserDatasets,
      updateSharingModalState,
      sharingSuccess,
      sharingError,
      updateCommunityModalVisibility,
      updateDatasetCommunityVisibility,
    } = this.props.dispatchProps;
    const {
      userDatasetsById,
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
    } = this.props.stateProps;
    const entry = userDatasetsById[id];
    const isOwner = !!(
      user &&
      entry &&
      entry.resource &&
      entry.resource.ownerUserId === user.id
    );

    const props = {
      baseUrl,
      includeAllLink,
      includeNameHeader,
      user,
      config,
      isOwner,
      location: window.location,
      updateError,
      removeUserDataset,
      quotaSize,
      userDatasetUpdating,
      shareUserDatasets,
      unshareUserDatasets,
      updateUserDatasetDetail,
      sharingModalOpen,
      sharingDatasetPending,
      sharingError,
      shareError,
      sharingSuccess,
      shareSuccessful,
      updateSharingModalState,
      userDataset: entry?.resource,
      fileListing: entry?.fileListing,
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
    };

    const DetailView = this.getDetailView(
      typeof entry?.resource === 'object' ? entry.resource.type : null
    );
    return entry?.resource?.meta.visibility !== 'public' &&
      user &&
      user.isGuest ? (
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
    ...state.userDatasetDetail,
  }),
  ActionCreators,
  (stateProps, dispatchProps, ownProps) => ({
    stateProps,
    dispatchProps,
    ownProps,
  })
);

export default enhance(UserDatasetDetailController);
