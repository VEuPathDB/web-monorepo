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

type StateProps = Pick<RootState['userDatasetDetail'], 'userDatasetsById' | 'loadError' | 'userDatasetUpdating' | 'updateError'>
           & Pick<RootState["globalData"], 'user' | 'questions' | 'config'>;
type DispatchProps =  typeof ActionCreators;
type OwnProps = { id: string; rootUrl: string; };
type MergedProps = OwnProps & DispatchProps & StateProps;


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
    const entry = this.props.userDatasetsById[this.props.id];
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
    const { userDatasetsById } = this.props;
    const idChanged = prevProps && prevProps.id !== this.props.id;
    if (idChanged || !userDatasetsById[this.props.id]) {
      this.props.loadUserDatasetDetail(Number(this.props.id));
    }
  }

  isRenderDataLoadError () {
    return this.props.loadError != null && this.props.loadError.status >= 500;
  }

  isRenderDataLoaded () {
    const { userDatasetsById, user, questions, config, id } = this.props;
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
          onClick={() => this.props.showLoginForm()}
        >Please log in to access My Data Sets.</button>
      }/>
    );
  }

  renderView () {
    const { id, rootUrl } = this.props;
    const { updateUserDatasetDetail, shareUserDatasets, removeUserDataset, unshareUserDatasets } = this.props;
    const { userDatasetsById, user, updateError, questions, config, userDatasetUpdating } = this.props;
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

const enhance = connect(
  (state: RootState) => ({
    ...state.globalData,
    ...state.userDatasetDetail
  }),
  ActionCreators
)

export default enhance(wrappable(UserDatasetDetailController));
