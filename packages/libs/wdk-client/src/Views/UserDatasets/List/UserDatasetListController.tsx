import * as React from 'react';

import '../UserDatasets.scss';
import { showLoginForm } from '../../User/UserActionCreators';
import PageController from '../../../Core/Controllers/PageController';
import { wrappable } from '../../../Utils/ComponentUtils';
import { UserDataset } from '../../../Utils/WdkModel';
import UserDatasetEmptyState from '../EmptyState';
import UserDatasetList from './UserDatasetList';
import {
  loadUserDatasetList,
  removeUserDataset,
  shareUserDatasets,
  unshareUserDatasets,
  updateProjectFilter,
  updateUserDatasetDetail,
} from '../UserDatasetsActionCreators';
import { quotaSize } from '../UserDatasetUtils';
import { RootState } from '../../../Core/State/Types';
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

type Props = typeof ActionCreators & Pick<RootState, 'globalData' | 'userDatasetList'>;

class UserDatasetListController extends PageController <Props> {

  getTitle () {
    return 'My Data Sets';
  }

  getActionCreators () {
    return ActionCreators;
  }

  loadData () {
    if (this.props.userDatasetList.status === 'not-requested') {
      this.props.loadUserDatasetList();
    }
  }

  isRenderDataLoaded () {
    return (
      this.props.userDatasetList.status !== 'not-requested' &&
      this.props.userDatasetList.status !== 'loading' &&
      this.props.globalData.config != null &&
      this.props.globalData.user != null
    );
  }

  isRenderDataLoadError() {
    return this.props.userDatasetList.status === 'error';
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
              onClick={() => this.props.showLoginForm()}
            >Please log in to access My Data Sets.</button>
          } />
        </div>
      </div>
    )
  }

  renderView () {
    const { config, user } = this.props.globalData;

    if (user == null || config == null) return this.renderDataLoading();

    if (user.isGuest) return this.renderGuestView();

    if (this.props.userDatasetList.status !== 'complete') return null;

    const { projectId, displayName: projectName } = config;

    const {
      userDatasetList: { userDatasets, userDatasetsById, filterByProject },
      shareUserDatasets,
      unshareUserDatasets,
      removeUserDataset,
      updateUserDatasetDetail,
      updateProjectFilter,
      history,
      location
    } = this.props;

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

const enhance = connect(
  (state: RootState) => ({
    globalData: state.globalData,
    userDatasetList: state.userDatasetList
  }),
  ActionCreators
)

export default enhance(wrappable(UserDatasetListController));
