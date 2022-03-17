import { connect } from 'react-redux';

import PageController from '@veupathdb/wdk-client/lib/Core/Controllers/PageController';
import { showLoginForm } from '@veupathdb/wdk-client/lib/Actions/UserSessionActions';

import { submitUploadForm } from '../Actions/UserDatasetUploadActions';

import MicrobiomeDBUploadForm from '../Components/MicrobiomeDBUploadForm';

import { StateSlice } from '../StoreModules/types';

const actionCreators = {
  showLoginForm,
  submitUploadForm,
};

type StateProps = Pick<StateSlice['userDatasetUpload'], 'badUploadMessage'> &
  Pick<StateSlice['globalData'], 'user'> &
  Pick<StateSlice['globalData'], 'config'>;
type DispatchProps = typeof actionCreators;

type OwnProps = {
  baseUrl: string;
  urlParams: Record<string, string>;
};

type MergedProps = StateProps & { userEvents: DispatchProps } & OwnProps;

class UserDatasetUploadController extends PageController<MergedProps> {
  getActionCreators() {
    return actionCreators;
  }

  isRenderDataLoaded() {
    return this.props.user != null && this.props.config != null;
  }

  getTitle() {
    return 'Upload My New Data Set';
  }

  renderMissingForm() {
    const projectName =
      this.props.config != null ? this.props.config.displayName : undefined;
    return (
      <div>
        There is currently no way to upload files through this page
        {projectName ? ' for ' + projectName : ''}.
        <br />
        To analyse your data and import them for analysis, try using{' '}
        <a href="https://eupathdb.globusgenomics.org"> our Galaxy instance</a>.
      </div>
    );
  }

  renderView() {
    const projectName =
      this.props.config != null ? this.props.config.displayName : undefined;

    return (
      <div className="stack">
        {projectName === 'MicrobiomeDB' ? (
          <MicrobiomeDBUploadForm
            baseUrl={this.props.baseUrl}
            badUploadMessage={this.props.badUploadMessage}
            submitForm={this.props.userEvents.submitUploadForm}
            urlParams={this.props.urlParams}
          />
        ) : (
          this.renderMissingForm()
        )}
      </div>
    );
  }
}

const enhance = connect<
  StateProps,
  DispatchProps,
  OwnProps,
  MergedProps,
  StateSlice
>(
  (state) => ({
    badUploadMessage: state.userDatasetUpload.badUploadMessage,
    user: state.globalData.user,
    config: state.globalData.config,
  }),
  actionCreators,
  (stateProps, dispatchProps, ownProps) => ({
    ...stateProps,
    ...ownProps,
    userEvents: dispatchProps,
  })
);

export default enhance(UserDatasetUploadController);
