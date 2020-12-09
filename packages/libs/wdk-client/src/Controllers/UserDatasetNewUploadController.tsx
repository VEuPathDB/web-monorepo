import * as React from 'react';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';
import PageController from 'wdk-client/Core/Controllers/PageController';
import MicrobiomeDBUploadForm from 'wdk-client/Views/UserDatasets/MicrobiomeDBUploadForm';
import { showLoginForm } from 'wdk-client/Actions/UserSessionActions';
import { submitUploadForm } from 'wdk-client/Actions/UserDatasetUploadActions';
import { RootState } from 'wdk-client/Core/State/Types';
import { connect } from 'react-redux';
import UserDatasetEmptyState from 'wdk-client/Views/UserDatasets/EmptyState';

const actionCreators = {
  showLoginForm,
  submitUploadForm
};

type StateProps =
  Pick<RootState['userDatasetUpload'], 'badUploadMessage'>
  & Pick<RootState['globalData'], 'user'>
  & Pick<RootState['globalData'], 'config'>;
type DispatchProps = typeof actionCreators;

type OwnProps = {
  urlParams: Record<string, string>;
}

type MergedProps = StateProps & { userEvents: DispatchProps } & OwnProps;

class UserDatasetUploadController extends PageController<MergedProps> {

  getActionCreators() {
    return actionCreators;
  }

  isRenderDataLoaded() {
    return (this.props.user != null && this.props.config != null);
  }

  getTitle() {
    return "Upload My New Data Set";
  }

  renderGuestView(){
    return (
      <UserDatasetEmptyState message={
        <button
          type="button"
          className="btn"
          onClick={() => this.props.userEvents.showLoginForm()}
        >Please log in to upload a new data set.</button>
      }/>
    );
  }

  renderMissingForm(){
    const projectName = this.props.config != null ? this.props.config.displayName : undefined;
    return (
      <div>
        There is currently no way to upload files through this page{projectName ? " for " + projectName: ""}.
        <br/>
        To analyse your data and import them for analysis, try using <a href="https://eupathdb.globusgenomics.org"> our Galaxy instance</a>.
      </div>
    );
  }

  renderUploadForm(){
    const projectName = this.props.config != null ? this.props.config.displayName : undefined;

    return (
      <div className="stack">
        { projectName === 'MicrobiomeDB'
          ? <MicrobiomeDBUploadForm badUploadMessage={this.props.badUploadMessage} submitForm={this.props.userEvents.submitUploadForm} />
          : this.renderMissingForm()
        }
      </div>
    );
  }

  renderView() {
    return (
      this.props.user && this.props.user.isGuest
      ? this.renderGuestView()
      : this.renderUploadForm()
    );
  }
}

const enhance = connect<StateProps, DispatchProps, OwnProps, MergedProps, RootState>(
  (state: RootState) => ({
    badUploadMessage: state.userDatasetUpload.badUploadMessage,
    user: state.globalData.user,
    config: state.globalData.config
  }),
  actionCreators,
  (stateProps, dispatchProps, ownProps) => ({ ...stateProps, ...ownProps, userEvents: dispatchProps })
)

export default enhance(wrappable(UserDatasetUploadController));
