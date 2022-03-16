import { connect } from 'react-redux';

import { wrappable } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import PageController from '@veupathdb/wdk-client/lib/Core/Controllers/PageController';
import { showLoginForm } from '@veupathdb/wdk-client/lib/Actions/UserSessionActions';

import {
  requestUploadMessages,
  cancelCurrentUpload,
  clearMessages,
} from '../Actions/UserDatasetUploadActions';

import AllUploads from '../Components/AllUploads';

import { StateSlice } from '../StoreModules/types';

const actionCreators = {
  showLoginForm,
  requestUploadMessages,
  cancelCurrentUpload,
  clearMessages,
};

type StateProps = StateSlice['userDatasetUpload'] &
  Pick<StateSlice['globalData'], 'user'>;

type DispatchProps = typeof actionCreators;
type OwnProps = { baseUrl: string };
type Props = StateProps & { actions: DispatchProps } & OwnProps;

class UserDatasetAllUploadsController extends PageController<Props> {
  loadData(prevProps?: Props) {
    if (prevProps != null) {
      return;
    }
    this.props.actions.requestUploadMessages();
  }

  getActionCreators() {
    return actionCreators;
  }

  isRenderDataLoaded() {
    return (
      this.props.user != null &&
      (this.props.uploads != null ||
        this.props.badAllUploadsActionMessage != null)
    );
  }

  getTitle() {
    return 'Recent Uploads';
  }

  renderView() {
    return (
      <div className="stack">
        <AllUploads
          baseUrl={this.props.baseUrl}
          errorMessage={this.props.badAllUploadsActionMessage}
          uploadList={this.props.uploads}
          actions={this.props.actions}
        />
      </div>
    );
  }
}

const enhance = connect<StateProps, DispatchProps, OwnProps, Props, StateSlice>(
  (state) => ({
    badAllUploadsActionMessage:
      state.userDatasetUpload.badAllUploadsActionMessage,
    uploads: state.userDatasetUpload.uploads,
    user: state.globalData.user,
  }),
  actionCreators,
  (stateProps, dispatchProps, ownProps) => ({
    ...stateProps,
    actions: dispatchProps,
    ...ownProps,
  })
);

export default enhance(wrappable(UserDatasetAllUploadsController));
