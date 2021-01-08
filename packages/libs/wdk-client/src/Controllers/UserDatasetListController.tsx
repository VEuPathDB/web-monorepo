import { Location } from 'history';
import * as React from 'react';
import { withRouter } from 'react-router-dom';

import 'wdk-client/Views/UserDatasets/UserDatasets.scss';
import { showLoginForm } from 'wdk-client/Actions/UserSessionActions';
import PageController from 'wdk-client/Core/Controllers/PageController';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';
import { UserDataset } from 'wdk-client/Utils/WdkModel';
import UserDatasetEmptyState from 'wdk-client/Views/UserDatasets/EmptyState';
import UserDatasetList from 'wdk-client/Views/UserDatasets/List/UserDatasetList';
import NoDatasetsMessage from 'wdk-client/Views/UserDatasets/NoDatasetsMessage';
import {
  loadUserDatasetList,
  removeUserDataset,
  shareUserDatasets,
  unshareUserDatasets,
  updateProjectFilter,
  updateUserDatasetDetail,
} from 'wdk-client/Actions/UserDatasetsActions';
import { requestUploadMessages } from 'wdk-client/Actions/UserDatasetUploadActions';
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
  updateProjectFilter,
  requestUploadMessages
};

type StateProps = Pick<RootState, 'globalData' | 'userDatasetList' | 'userDatasetUpload' >;
type DispatchProps = typeof ActionCreators;
type OwnProps = {
  location: Location;
}
type Props = {
  ownProps: OwnProps;
  dispatchProps: DispatchProps;
  stateProps: StateProps;
};

class UserDatasetListController extends PageController <Props> {

  constructor(props: Props) {
    super(props);
    this.needsUploadMessages = this.needsUploadMessages.bind(this);
  }
  getTitle () {
    return 'My Data Sets';
  }

  getActionCreators () {
    return ActionCreators;
  }
  needsUploadMessages(){
    const { config } = this.props.stateProps.globalData;
    if (config == null) {
      return true;
    }
    const { uploads, badAllUploadsActionMessage } = this.props.stateProps.userDatasetUpload;
    return config.displayName == 'MicrobiomeDB' && uploads == null && badAllUploadsActionMessage == null;
  }

  loadData (prevProps?: Props) {
    if (prevProps == null){
      this.props.dispatchProps.loadUserDatasetList();
      return;
    }

    const { config } = this.props.stateProps.globalData;
    if (config != null 
      && prevProps.stateProps.userDatasetList.status !== this.props.stateProps.userDatasetList.status
      && this.needsUploadMessages()){
      this.props.dispatchProps.requestUploadMessages();
    }
  }


  isRenderDataLoaded () {
    return (
      this.props.stateProps.userDatasetList.status !== 'not-requested' &&
      this.props.stateProps.userDatasetList.status !== 'loading' &&
      this.props.stateProps.globalData.config != null &&
      this.props.stateProps.globalData.user != null &&
      ! this.needsUploadMessages()
    );
  }

  isRenderDataLoadError() {
    return this.props.stateProps.userDatasetList.status === 'error';
  }

  renderView () {
    const { config, user } = this.props.stateProps.globalData;

    if (user == null || config == null) return this.renderDataLoading();

    if (this.props.stateProps.userDatasetList.status !== 'complete') return null;

    const { projectId, displayName: projectName } = config;

    const {
      location
    } = this.props.ownProps;

    const {
      userDatasetList: { userDatasets, userDatasetsById, filterByProject },
      userDatasetUpload: { uploads }
    } = this.props.stateProps;

    const numOngoingUploads = uploads != null ? uploads.filter(upload => upload.isOngoing).length : 0;

    const {
      shareUserDatasets,
      unshareUserDatasets,
      removeUserDataset,
      updateUserDatasetDetail,
      updateProjectFilter,
    } = this.props.dispatchProps;


    const listProps = {
      user,
      location,
      projectId,
      projectName,
      numOngoingUploads,
      quotaSize,
      userDatasets: userDatasets.map(id => userDatasetsById[id].resource) as UserDataset[],
      filterByProject,
      shareUserDatasets,
      unshareUserDatasets,
      removeUserDataset,
      updateUserDatasetDetail,
      updateProjectFilter,
    };
    const noDatasetsForThisProject = userDatasets.map(id => userDatasetsById[id].resource.projects).flat().indexOf(projectId) == -1; 

    return (
      <div className="UserDatasetList-Controller">
        <div className="UserDatasetList-Content">
          { noDatasetsForThisProject
            ? <NoDatasetsMessage projectName={projectName}/>
            : <UserDatasetList {...listProps} />
          }
        </div>
      </div>
    )
  }
}

const enhance = connect<StateProps, DispatchProps, OwnProps, Props, RootState>(
  (state: RootState) => ({
    globalData: state.globalData,
    userDatasetList: state.userDatasetList,
    userDatasetUpload: state.userDatasetUpload
  }),
  ActionCreators,
  (stateProps, dispatchProps, ownProps) => ({ stateProps, dispatchProps, ownProps })
)

export default withRouter(enhance(wrappable(UserDatasetListController)));
