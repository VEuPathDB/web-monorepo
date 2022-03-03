import { connect } from 'react-redux';

import { wrappable } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import PageController from '@veupathdb/wdk-client/lib/Core/Controllers/PageController';
import { showLoginForm } from '@veupathdb/wdk-client/lib/Actions/UserSessionActions';

import { RootState } from '@veupathdb/wdk-client/lib/Core/State/Types';

import {
  requestUploadMessages,
  cancelCurrentUpload,
  clearMessages,
} from '../Actions/UserDatasetUploadActions';

import AllUploads from '../Components/AllUploads';

import {
  State as UserDatasetUploadState,
} from '../StoreModules/UserDatasetUploadStoreModule';

const actionCreators = {
  showLoginForm,
  requestUploadMessages,
  cancelCurrentUpload,
  clearMessages,
};

interface StateSlice extends RootState {
  userDatasetUpload: UserDatasetUploadState;
}

type StateProps = UserDatasetUploadState & Pick<RootState['globalData'], 'user'>;

type DispatchProps = typeof actionCreators;
type Props = StateProps & { actions: DispatchProps };

class UserDatasetAllUploadsController extends PageController<Props> {

  loadData(prevProps?: Props) {
    if (prevProps != null){
      return;
    }
    this.props.actions.requestUploadMessages();
  }

  getActionCreators() {
    return actionCreators;
  }

  isRenderDataLoaded() {
    return (this.props.user != null && (this.props.uploads !=null || this.props.badAllUploadsActionMessage != null));
  }

  getTitle() {
    return "Recent Uploads";
  }

  renderView(){
    return (
      <div className="stack">
        <AllUploads 
          errorMessage={this.props.badAllUploadsActionMessage}
          uploadList={this.props.uploads}
          actions={this.props.actions} />
      </div>
    );
  }
}

const enhance = connect<StateProps, DispatchProps, {}, Props, StateSlice>(
  state => ({
    badAllUploadsActionMessage: state.userDatasetUpload.badAllUploadsActionMessage,
    uploads: state.userDatasetUpload.uploads,
    user: state.globalData.user
  }),
  actionCreators,
  (stateProps, dispatchProps) => ({ ...stateProps, actions: dispatchProps })
)

export default enhance(wrappable(UserDatasetAllUploadsController));
