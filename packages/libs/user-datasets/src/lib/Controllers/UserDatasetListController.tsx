import { connect } from "react-redux";
import { RouteComponentProps, withRouter } from "react-router-dom";

import { showLoginForm } from "@veupathdb/wdk-client/lib/Actions/UserSessionActions";
import PageController from "@veupathdb/wdk-client/lib/Core/Controllers/PageController";

import {
  loadUserDatasetList,
  removeUserDataset,
  shareUserDatasets,
  unshareUserDataset,
  updateProjectFilter,
  updateUserDatasetDetail,
  updateSharingModalState,
  sharingError,
  sharingSuccess,
  updateCommunityModalVisibility,
  updateDatasetCommunityVisibility,
} from "../Actions/UserDatasetsActions";
import { requestUploadMessages } from "../Actions/UserDatasetUploadActions";

import UserDatasetList from "../Components/List/UserDatasetList";
import NoDatasetsMessage from "../Components/NoDatasetsMessage";
import { quotaSize } from "../Components/UserDatasetUtils";

import { StateSlice } from "../StoreModules/types";

import { VDIConfig } from "../Utils/types";

import "../Components/UserDatasets.scss";
import { VariableDisplayText } from "../Components/FormTypes";

const ActionCreators = {
  showLoginForm,
  loadUserDatasetList,
  updateUserDatasetDetail,
  removeUserDataset,
  shareUserDatasets,
  unshareUserDatasets: unshareUserDataset,
  updateProjectFilter,
  requestUploadMessages,
  updateSharingModalState,
  sharingError,
  sharingSuccess,
  updateCommunityModalVisibility,
  updateDatasetCommunityVisibility,
};

type StateProps = Pick<
  StateSlice,
  "userDatasetList" | "userDatasetUpload" | "globalData"
>;

type DispatchProps = typeof ActionCreators;

interface OwnProps extends RouteComponentProps {
  readonly baseUrl: string;
  readonly hasDirectUpload: boolean;
  readonly helpRoute: string;
  readonly displayText: VariableDisplayText;
  readonly enablePublicUserDatasets: boolean;
  readonly vdiConfig: VDIConfig;
}

type Props = {
  readonly ownProps: OwnProps;
  readonly dispatchProps: DispatchProps;
  readonly stateProps: StateProps;
};

class UserDatasetListController extends PageController<Props> {
  constructor(props: Props) {
    super(props);
    this.needsUploadMessages = this.needsUploadMessages.bind(this);
  }

  getTitle() {
    return this.props.ownProps.displayText.workspaceTitle;
  }

  getActionCreators() {
    return ActionCreators;
  }

  needsUploadMessages() {
    if (this.props.stateProps.globalData == null)
      return true;

    const { uploads, badAllUploadsActionMessage } =
      this.props.stateProps.userDatasetUpload;

    return this.props.ownProps.hasDirectUpload
      && uploads == null
      && badAllUploadsActionMessage == null;
  }

  loadData(prevProps?: Props) {
    const { dispatchProps, stateProps } = this.props;

    if (prevProps == null) {
      dispatchProps.loadUserDatasetList();
      return;
    }

    if (
      stateProps.globalData.config != null
      && prevProps.stateProps.userDatasetList.status !== stateProps.userDatasetList.status
      && this.needsUploadMessages()
    ) {
      dispatchProps.requestUploadMessages();
    }
  }

  isRenderDataLoaded() {
    return this.props.stateProps.userDatasetList.status !== "not-requested"
      && this.props.stateProps.userDatasetList.status !== "loading"
      && this.props.stateProps.globalData.config != null
      && this.props.stateProps.globalData.user != null;
  }

  isRenderDataLoadError() {
    return this.props.stateProps.userDatasetList.status === "error";
  }

  renderView() {
    const { config, user } = this.props.stateProps.globalData;

    if (user == null || config == null)
      return this.renderDataLoading();

    if (this.props.stateProps.userDatasetList.status !== "complete")
      return null;

    const { projectId, displayName: projectName } = config;

    const {
      baseUrl,
      hasDirectUpload,
      helpRoute,
      location,
      enablePublicUserDatasets,
      displayText,
      vdiConfig,
    } = this.props.ownProps;

    const {
      userDatasetList: {
        userDatasets,
        userDatasetsById,
        filterByProject,
        sharingDatasetPending,
        sharingModalOpen,
        shareError,
        shareSuccessful,
        communityModalOpen,
        updateDatasetCommunityVisibilityError,
        updateDatasetCommunityVisibilityPending,
        updateDatasetCommunityVisibilitySuccess,
      },
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
      updateSharingModalState,
      sharingSuccess,
      sharingError,
      updateCommunityModalVisibility,
      updateDatasetCommunityVisibility,
    } = this.props.dispatchProps;

    const listProps = {
      baseUrl,
      user,
      location,
      displayText,
      projectId,
      projectName,
      numOngoingUploads,
      quotaSize,
      enablePublicUserDatasets,
      userDatasets: userDatasets.map(id => userDatasetsById[id].resource),
      filterByProject,
      shareUserDatasets,
      unshareUserDatasets,
      removeUserDataset,
      updateUserDatasetDetail,
      updateProjectFilter,
      sharingDatasetPending,
      shareError,
      shareSuccessful,
      sharingModalOpen,
      updateSharingModalState,
      sharingSuccess,
      sharingError,
      updateCommunityModalVisibility,
      updateDatasetCommunityVisibility,
      communityModalOpen,
      updateDatasetCommunityVisibilityError,
      updateDatasetCommunityVisibilityPending,
      updateDatasetCommunityVisibilitySuccess,
      vdiConfig,
    };
    const haveDatasetsForThisProject =
      userDatasets.some(id => userDatasetsById[id].resource.installTargets.some(tgt => tgt === projectId));

    return (
      <div className="UserDatasetList-Controller">
        <div className="UserDatasetList-Content">
          {haveDatasetsForThisProject
            ? <UserDatasetList {...listProps} />
            : <NoDatasetsMessage
              baseUrl={baseUrl}
              hasDirectUpload={hasDirectUpload}
              helpRoute={helpRoute}
            />}
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
  }),
);

export default withRouter(enhance(UserDatasetListController));
