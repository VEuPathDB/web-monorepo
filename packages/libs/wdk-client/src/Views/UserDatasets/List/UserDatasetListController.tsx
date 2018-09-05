import * as React from 'react';

import '../UserDatasets.scss';
import { showLoginForm } from '../../../Core/ActionCreators/UserActionCreators';
import AbstractPageController from '../../../Core/Controllers/AbstractPageController';
import { wrappable } from '../../../Utils/ComponentUtils';
import { UserDataset } from '../../../Utils/WdkModel';
import UserDatasetEmptyState from '../EmptyState';
import UserDatasetList from './UserDatasetList';
import UserDatasetListStore, { State as StoreState } from './UserDatasetListStore';
import {
  loadUserDatasetList,
  removeUserDataset,
  shareUserDatasets,
  unshareUserDatasets,
  updateProjectFilter,
  updateUserDatasetDetail,
} from '../UserDatasetsActionCreators';
import { quotaSize } from '../UserDatasetUtils';

const ActionCreators = {
  updateUserDatasetDetail,
  removeUserDataset,
  shareUserDatasets,
  unshareUserDatasets,
  updateProjectFilter
};

class UserDatasetListController extends AbstractPageController <StoreState, UserDatasetListStore, typeof ActionCreators> {

  getStoreClass () {
    return UserDatasetListStore;
  }

  getStateFromStore () {
    return this.store.getState();
  }

  getTitle () {
    return 'My Data Sets';
  }

  getActionCreators () {
    return ActionCreators;
  }

  loadData () {
    if (this.state.status === 'not-requested') {
      this.dispatchAction(loadUserDatasetList());
    }
  }

  isRenderDataLoaded () {
    return (
      this.state.status !== 'not-requested' &&
      this.state.status !== 'loading' &&
      this.state.globalData.config != null &&
      this.state.globalData.user != null
    );
  }

  isRenderDataLoadError() {
    return this.state.status === 'error';
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
              onClick={() => this.dispatchAction(showLoginForm())}
            >Please log in to access My Data Sets.</button>
          } />
        </div>
      </div>
    )
  }

  renderView () {
    const { user } = this.state.globalData;

    if (user.isGuest) return this.renderGuestView();

    if (this.state.status !== 'complete') return null;

    const { userDatasets, userDatasetsById, filterByProject, globalData: { config } } = this.state;
    const { projectId, displayName: projectName } = config;
    const { history, location } = this.props;

    const listProps = {
      user,
      history,
      location,
      projectId,
      projectName,
      quotaSize,
      userDatasets: userDatasets.map(id => userDatasetsById[id].resource) as UserDataset[],
      filterByProject,
      ...this.eventHandlers
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

export default wrappable(UserDatasetListController);
