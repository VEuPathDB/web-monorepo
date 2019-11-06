import * as React from 'react';
import { History, Location } from 'history';

import 'wdk-client/Views/UserDatasets/UserDatasets.scss';
import { showLoginForm } from 'wdk-client/Actions/UserSessionActions';
import PageController from 'wdk-client/Core/Controllers/PageController';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';
import { UserDataset } from 'wdk-client/Utils/WdkModel';
import UserDatasetEmptyState from 'wdk-client/Views/UserDatasets/EmptyState';
import UserDatasetList from 'wdk-client/Views/UserDatasets/List/UserDatasetList';
import {
  loadUserDatasetList,
  removeUserDataset,
  shareUserDatasets,
  unshareUserDatasets,
  updateProjectFilter,
  updateUserDatasetDetail,
} from 'wdk-client/Actions/UserDatasetsActions';
import { quotaSize } from 'wdk-client/Views/UserDatasets/UserDatasetUtils';
import { RootState } from 'wdk-client/Core/State/Types';
import { connect } from 'react-redux';

const ActionCreators = {
  showLoginForm,
  loadUserDatasetList,
  updateUserDatasetDetail,
  removeUserDataset,
  shareUserDatasets,
  unshareUserDatasets,
  updateProjectFilter
};

type StateProps = Pick<RootState, 'globalData' | 'userDatasetList'>;
type DispatchProps = typeof ActionCreators;
type OwnProps = {
  history: History;
  location: Location;
}
type Props = {
  ownProps: OwnProps;
  dispatchProps: DispatchProps;
  stateProps: StateProps;
};

class UserDatasetListController extends PageController <Props> {

  getTitle () {
    return 'My Data Sets';
  }

  getActionCreators () {
    return ActionCreators;
  }

  loadData (prevProps?: Props) {
    if (prevProps == null) {
      this.props.dispatchProps.loadUserDatasetList();
    }
  }

  isRenderDataLoaded () {
    return (
      this.props.stateProps.userDatasetList.status !== 'not-requested' &&
      this.props.stateProps.userDatasetList.status !== 'loading' &&
      this.props.stateProps.globalData.config != null &&
      this.props.stateProps.globalData.user != null
    );
  }

  isRenderDataLoadError() {
    return this.props.stateProps.userDatasetList.status === 'error';
  }

  renderGuestView() {
    const title = this.getTitle();
    return (
      <div className="UserDatasetList-Controller">
        <h1 className="UserDatasetList-Title">{title}</h1>
        <div className="UserDatasetList-Content">
          <UserDatasetEmptyState message={
            <button
              type="button"
              className="btn"
              onClick={() => this.props.dispatchProps.showLoginForm()}
            >Please log in to access My Data Sets.</button>
          } />
        </div>
      </div>
    )
  }

  renderView () {
    const { config, user } = this.props.stateProps.globalData;

    if (user == null || config == null) return this.renderDataLoading();

    if (user.isGuest) return this.renderGuestView();

    if (this.props.stateProps.userDatasetList.status !== 'complete') return null;

    const { projectId, displayName: projectName } = config;

    const {
      history,
      location
    } = this.props.ownProps;

    const {
      userDatasetList: { userDatasets, userDatasetsById, filterByProject }
    } = this.props.stateProps;

    const {
      shareUserDatasets,
      unshareUserDatasets,
      removeUserDataset,
      updateUserDatasetDetail,
      updateProjectFilter,
    } = this.props.dispatchProps;

    const listProps = {
      user,
      history,
      location,
      projectId,
      projectName,
      quotaSize,
      userDatasets: userDatasets.map(id => userDatasetsById[id].resource) as UserDataset[],
      filterByProject,
      shareUserDatasets,
      unshareUserDatasets,
      removeUserDataset,
      updateUserDatasetDetail,
      updateProjectFilter,
    };
    return (
      <div className="UserDatasetList-Controller">
        <div className="UserDatasetList-Content">
          <UserDatasetList {...listProps} />
        </div>
      </div>
    )
  }
}

const enhance = connect<StateProps, DispatchProps, OwnProps, Props, RootState>(
  (state: RootState) => ({
    globalData: state.globalData,
    userDatasetList: state.userDatasetList
  }),
  ActionCreators,
  (stateProps, dispatchProps, ownProps) => ({ stateProps, dispatchProps, ownProps })
)

export default enhance(wrappable(UserDatasetListController));
