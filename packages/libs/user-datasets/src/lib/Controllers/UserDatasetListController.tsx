import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { showLoginForm } from '@veupathdb/wdk-client/lib/Actions/UserSessionActions';
import PageController from '@veupathdb/wdk-client/lib/Core/Controllers/PageController';

import {
  loadUserDatasetList,
  removeUserDataset,
  shareUserDatasets,
  unshareUserDatasets,
  updateProjectFilter,
  updateUserDatasetDetail,
} from '../Actions/UserDatasetsActions';
import { requestUploadMessages } from '../Actions/UserDatasetUploadActions';

import UserDatasetList from '../Components/List/UserDatasetList';
import NoDatasetsMessage from '../Components/NoDatasetsMessage';
import { quotaSize } from '../Components/UserDatasetUtils';

import { StateSlice } from '../StoreModules/types';

import { UserDataset } from '../Utils/types';

import '../Components/UserDatasets.scss';

const ActionCreators = {
  showLoginForm,
  loadUserDatasetList,
  updateUserDatasetDetail,
  removeUserDataset,
  shareUserDatasets,
  unshareUserDatasets,
  updateProjectFilter,
  requestUploadMessages,
};

type StateProps = Pick<
  StateSlice,
  'userDatasetList' | 'userDatasetUpload' | 'globalData'
>;
type DispatchProps = typeof ActionCreators;
interface OwnProps extends RouteComponentProps<{}> {
  baseUrl: string;
  hasDirectUpload: boolean;
  helpRoute: string;
  workspaceTitle: string;
}
type Props = {
  ownProps: OwnProps;
  dispatchProps: DispatchProps;
  stateProps: StateProps;
};

class UserDatasetListController extends PageController<Props> {
  constructor(props: Props) {
    super(props);
    this.needsUploadMessages = this.needsUploadMessages.bind(this);
  }
  getTitle() {
    return this.props.ownProps.workspaceTitle;
  }

  getActionCreators() {
    return ActionCreators;
  }
  needsUploadMessages() {
    const { config } = this.props.stateProps.globalData;
    const { hasDirectUpload } = this.props.ownProps;
    if (config == null) {
      return true;
    }
    const {
      uploads,
      badAllUploadsActionMessage,
    } = this.props.stateProps.userDatasetUpload;
    return (
      hasDirectUpload && uploads == null && badAllUploadsActionMessage == null
    );
  }

  loadData(prevProps?: Props) {
    if (prevProps == null) {
      this.props.dispatchProps.loadUserDatasetList();
      return;
    }

    const { config } = this.props.stateProps.globalData;
    if (
      config != null &&
      prevProps.stateProps.userDatasetList.status !==
        this.props.stateProps.userDatasetList.status &&
      this.needsUploadMessages()
    ) {
      this.props.dispatchProps.requestUploadMessages();
    }
  }

  isRenderDataLoaded() {
    return (
      this.props.stateProps.userDatasetList.status !== 'not-requested' &&
      this.props.stateProps.userDatasetList.status !== 'loading' &&
      this.props.stateProps.globalData.config != null &&
      this.props.stateProps.globalData.user != null &&
      !this.needsUploadMessages()
    );
  }

  isRenderDataLoadError() {
    return this.props.stateProps.userDatasetList.status === 'error';
  }

  renderView() {
    const { config, user } = this.props.stateProps.globalData;

    if (user == null || config == null) return this.renderDataLoading();

    if (this.props.stateProps.userDatasetList.status !== 'complete')
      return null;

    const { projectId, displayName: projectName } = config;

    const {
      baseUrl,
      hasDirectUpload,
      helpRoute,
      location,
    } = this.props.ownProps;

    const {
      userDatasetList: { userDatasets, userDatasetsById, filterByProject },
      userDatasetUpload: { uploads },
    } = this.props.stateProps;

    const numOngoingUploads =
      uploads != null ? uploads.filter((upload) => upload.isOngoing).length : 0;

    const {
      shareUserDatasets,
      unshareUserDatasets,
      removeUserDataset,
      updateUserDatasetDetail,
      updateProjectFilter,
    } = this.props.dispatchProps;

    const listProps = {
      baseUrl,
      user,
      location,
      projectId,
      projectName,
      numOngoingUploads,
      quotaSize,
      userDatasets: userDatasets.map(
        (id) => userDatasetsById[id].resource
      ) as UserDataset[],
      filterByProject,
      shareUserDatasets,
      unshareUserDatasets,
      removeUserDataset,
      updateUserDatasetDetail,
      updateProjectFilter,
    };
    const noDatasetsForThisProject =
      userDatasets
        .map((id) => userDatasetsById[id].resource.projects)
        .flat()
        .indexOf(projectId) === -1;

    return (
      <div className="UserDatasetList-Controller">
        <div className="UserDatasetList-Content">
          {noDatasetsForThisProject ? (
            <NoDatasetsMessage
              baseUrl={baseUrl}
              hasDirectUpload={hasDirectUpload}
              helpRoute={helpRoute}
            />
          ) : (
            <UserDatasetList {...listProps} />
          )}
        </div>
      </div>
    );
  }
}

const enhance = connect<StateProps, DispatchProps, OwnProps, Props, StateSlice>(
  (state) => ({
    globalData: state.globalData,
    userDatasetList: state.userDatasetList,
    userDatasetUpload: state.userDatasetUpload,
  }),
  ActionCreators,
  (stateProps, dispatchProps, ownProps) => ({
    stateProps,
    dispatchProps,
    ownProps,
  })
);

export default withRouter(enhance(UserDatasetListController));
