import { keyBy } from 'lodash';
import { connect } from 'react-redux';

import { showLoginForm } from '@veupathdb/wdk-client/lib/Actions/UserSessionActions';
import PageController from '@veupathdb/wdk-client/lib/Core/Controllers/PageController';
import { wrappable } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { Question } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import BigwigDatasetDetail from '@veupathdb/wdk-client/lib/Views/UserDatasets/Detail/BigwigDatasetDetail';
import BiomDatasetDetail from '@veupathdb/wdk-client/lib/Views/UserDatasets/Detail/BiomDatasetDetail';
import RnaSeqDatasetDetail from '@veupathdb/wdk-client/lib/Views/UserDatasets/Detail/RnaSeqDatasetDetail';
import UserDatasetDetail from '@veupathdb/wdk-client/lib/Views/UserDatasets/Detail/UserDatasetDetail';
import EmptyState from '@veupathdb/wdk-client/lib/Views/UserDatasets/EmptyState';
import { quotaSize } from '@veupathdb/wdk-client/lib/Views/UserDatasets/UserDatasetUtils';
import { RootState } from '@veupathdb/wdk-client/lib/Core/State/Types';

import {
  loadUserDatasetDetail,
  removeUserDataset,
  shareUserDatasets,
  unshareUserDatasets,
  updateUserDatasetDetail,
} from '../Actions/UserDatasetsActions';

import {
  State as UserDatasetDetailState,
} from '../StoreModules/UserDatasetDetailStoreModule';

const ActionCreators = {
  showLoginForm,
  loadUserDatasetDetail,
  updateUserDatasetDetail,
  removeUserDataset,
  shareUserDatasets,
  unshareUserDatasets
};

interface StateSlice extends RootState {
  userDatasetDetail: UserDatasetDetailState;
}

type StateProps = StateSlice['userDatasetDetail'] & StateSlice['globalData'];
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
    const idChanged = prevProps == null || prevProps.ownProps.id !== this.props.ownProps.id;
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
      case 'BIOM':
        return BiomDatasetDetail;
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

const enhance = connect<StateProps, DispatchProps, OwnProps, MergedProps, StateSlice>(
  state => ({
    ...state.globalData,
    ...state.userDatasetDetail
  }),
  ActionCreators,
  (stateProps, dispatchProps, ownProps) => ({ stateProps, dispatchProps, ownProps })
)

export default enhance(wrappable(UserDatasetDetailController));
