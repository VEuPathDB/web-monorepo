import { ReactNode } from 'react';

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
} from '../Actions/UserDatasetsActions';

import BigwigDatasetDetail from '../Components/Detail/BigwigDatasetDetail';
import BiomDatasetDetail from '../Components/Detail/BiomDatasetDetail';
import RnaSeqDatasetDetail from '../Components/Detail/RnaSeqDatasetDetail';
import UserDatasetDetail from '../Components/Detail/UserDatasetDetail';
import EmptyState from '../Components/EmptyState';
import { quotaSize } from '../Components/UserDatasetUtils';

import { StateSlice } from '../StoreModules/types';

const ActionCreators = {
  showLoginForm,
  loadUserDatasetDetail,
  updateUserDatasetDetail,
  removeUserDataset,
  shareUserDatasets,
  unshareUserDatasets,
};

type StateProps = StateSlice['userDatasetDetail'] & StateSlice['globalData'];
type DispatchProps = typeof ActionCreators;
type OwnProps = {
  baseUrl: string;
  detailsPageTitle: ReactNode;
  workspaceTitle: ReactNode;
  id: string;
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
    const entry = this.props.stateProps.userDatasetsById[
      this.props.ownProps.id
    ];
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
      this.props.dispatchProps.loadUserDatasetDetail(
        Number(this.props.ownProps.id)
      );
    }
  }

  isRenderDataLoadError() {
    return (
      this.props.stateProps.loadError != null &&
      this.props.stateProps.loadError.status >= 500
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
    switch (name) {
      case 'Bigwigs':
      case 'BigwigFiles':
        return BigwigDatasetDetail;
      case 'RnaSeq':
        return RnaSeqDatasetDetail;
      case 'BIOM':
        return BiomDatasetDetail;
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
    } = this.props.ownProps;
    const {
      updateUserDatasetDetail,
      shareUserDatasets,
      removeUserDataset,
      unshareUserDatasets,
    } = this.props.dispatchProps;
    const {
      userDatasetsById,
      user,
      updateError,
      questions,
      config,
      userDatasetUpdating,
    } = this.props.stateProps;
    const entry = userDatasetsById[id];
    const isOwner = !!(
      user &&
      entry.resource &&
      entry.resource.ownerUserId === user.id
    );

    const props = {
      baseUrl,
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
      userDataset: entry.resource,
      getQuestionUrl: this.getQuestionUrl,
      questionMap: keyBy(questions, 'fullName'),
      workspaceTitle,
      detailsPageTitle,
    };

    const DetailView = this.getDetailView(
      typeof entry.resource === 'object' ? entry.resource.type : null
    );
    return user && user.isGuest ? (
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
