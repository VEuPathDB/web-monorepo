import { keyBy } from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';

import { showLoginForm } from 'wdk-client/Actions/UserSessionActions';
import PageController from 'wdk-client/Core/Controllers/PageController';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';
import { Question } from 'wdk-client/Utils/WdkModel';
import BigwigDatasetDetail from 'wdk-client/Views/UserDatasets/Detail/BigwigDatasetDetail';
import RnaSeqDatasetDetail from 'wdk-client/Views/UserDatasets/Detail/RnaSeqDatasetDetail';
import UserDatasetDetail from 'wdk-client/Views/UserDatasets/Detail/UserDatasetDetail';
import EmptyState from 'wdk-client/Views/UserDatasets/EmptyState';
import {
  loadUserDatasetDetail,
  removeUserDataset,
  shareUserDatasets,
  unshareUserDatasets,
  updateUserDatasetDetail,
} from 'wdk-client/Actions/UserDatasetsActions';
import { quotaSize } from 'wdk-client/Views/UserDatasets/UserDatasetUtils';
import { RootState } from 'wdk-client/Core/State/Types';

const ActionCreators = {
  showLoginForm,
  loadUserDatasetDetail,
  updateUserDatasetDetail,
  removeUserDataset,
  shareUserDatasets,
  unshareUserDatasets
};

type StateProps = RootState['userDatasetDetail'] & RootState['globalData'];
type DispatchProps =  typeof ActionCreators;
type OwnProps = { id: string; rootUrl: string; };
type MergedProps = {
  ownProps: OwnProps;
  dispatchProps: DispatchProps;
  stateProps: StateProps
}


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
  }


  getTitle () {
    const entry = this.props.stateProps.userDatasetsById[this.props.ownProps.id];
    if (entry && entry.resource) {
      return `My Data Set ${entry.resource.meta.name}`;
    }
    if (entry && !entry.resource) {
      return `My Data Set not found`;
    }
    return `My Data Set ...`;
  }

  getActionCreators () {
    return ActionCreators;
  }

  loadData (prevProps?: this['props']) {
    const idChanged = prevProps && prevProps.ownProps.id !== this.props.ownProps.id;
    if (idChanged) {
      this.props.dispatchProps.loadUserDatasetDetail(Number(this.props.ownProps.id));
    }
  }

  isRenderDataLoadError () {
    return this.props.stateProps.loadError != null && this.props.stateProps.loadError.status >= 500;
  }

  isRenderDataLoaded () {
    const { id } = this.props.ownProps;
    const { userDatasetsById, user, questions, config } = this.props.stateProps;
    const entry = userDatasetsById[id];
    if (user && user.isGuest) return true;
    return (entry && !entry.isLoading && user && questions && config)
      ? true
      : false;
  }

  getDetailView (type: any) {
    const name: string = type && typeof type === 'object' ? type.name : null;
    switch (name) {
      case 'Bigwigs':
      case 'BigwigFiles':
        return BigwigDatasetDetail;
      case 'RnaSeq':
        return RnaSeqDatasetDetail;
      default:
        return UserDatasetDetail;
    }
  }

  renderGuestView() {
    return (
      <EmptyState message={
        <button
          type="button"
          className="btn"
          onClick={() => this.props.dispatchProps.showLoginForm()}
        >Please log in to access My Data Sets.</button>
      }/>
    );
  }

  renderView () {
    const { id, rootUrl } = this.props.ownProps;
    const { updateUserDatasetDetail, shareUserDatasets, removeUserDataset, unshareUserDatasets } = this.props.dispatchProps;
    const { userDatasetsById, user, updateError, questions, config, userDatasetUpdating } = this.props.stateProps;
    const entry = userDatasetsById[id];
    const isOwner = !!(user && entry.resource && entry.resource.ownerUserId === user.id);

    const props = {
      user,
      config,
      isOwner,
      rootUrl,
      location,
      updateError,
      removeUserDataset,
      quotaSize,
      userDatasetUpdating,
      shareUserDatasets,
      unshareUserDatasets,
      updateUserDatasetDetail,
      userDataset: entry.resource,
      getQuestionUrl: this.getQuestionUrl,
      questionMap: keyBy(questions, 'fullName')
    };

    const DetailView = this.getDetailView(typeof entry.resource === 'object' ? entry.resource.type : null);
    return user && user.isGuest
      ? this.renderGuestView()
      : <DetailView {...props}/>
  }
}

const enhance = connect<StateProps, DispatchProps, OwnProps, MergedProps, RootState>(
  (state: RootState) => ({
    ...state.globalData,
    ...state.userDatasetDetail
  }),
  ActionCreators,
  (stateProps, dispatchProps, ownProps) => ({ stateProps, dispatchProps, ownProps })
)

export default enhance(wrappable(UserDatasetDetailController));
