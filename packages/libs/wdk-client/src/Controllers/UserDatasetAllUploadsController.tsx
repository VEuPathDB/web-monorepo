import * as React from 'react';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';
import PageController from 'wdk-client/Core/Controllers/PageController';
import AllUploads from 'wdk-client/Views/UserDatasets/AllUploads';
import { showLoginForm } from 'wdk-client/Actions/UserSessionActions';
import { requestUploadMessages, cancelCurrentUpload, clearMessages } from 'wdk-client/Actions/UserDatasetUploadActions';
import { RootState } from 'wdk-client/Core/State/Types';
import { connect } from 'react-redux';
import UserDatasetEmptyState from 'wdk-client/Views/UserDatasets/EmptyState';

const actionCreators = {
  showLoginForm,
  requestUploadMessages,
  cancelCurrentUpload,
  clearMessages
};

type StateProps = RootState['userDatasetUpload'] & Pick<RootState['globalData'], 'user'>;

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

  renderGuestView(){
    return (
      <UserDatasetEmptyState message={
        <button
          type="button"
          className="btn"
          onClick={() => this.props.actions.showLoginForm()}
        >Please log in to view your data set uploads.</button>
      }/>
    );
  }

  renderAllUploads(){
    return (
      <div className="stack">
        <AllUploads 
          errorMessage={this.props.badAllUploadsActionMessage}
          uploadList={this.props.uploads}
          actions={this.props.actions} />
      </div>
    );
  }

  renderView() {
    return this.props.user && this.props.user.isGuest
      ? this.renderGuestView()
      : this.renderAllUploads();
  }
}

const enhance = connect<StateProps, DispatchProps, {}, Props, RootState>(
  (state: RootState) => ({
    badAllUploadsActionMessage: state.userDatasetUpload.badAllUploadsActionMessage,
    uploads: state.userDatasetUpload.uploads,
    user: state.globalData.user
  }),
  actionCreators,
  (stateProps, dispatchProps) => ({ ...stateProps, actions: dispatchProps })
)

export default enhance(wrappable(UserDatasetAllUploadsController));
