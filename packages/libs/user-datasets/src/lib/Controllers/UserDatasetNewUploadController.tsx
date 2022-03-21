import { connect } from 'react-redux';

import PageController from '@veupathdb/wdk-client/lib/Core/Controllers/PageController';
import { showLoginForm } from '@veupathdb/wdk-client/lib/Actions/UserSessionActions';

import { submitUploadForm } from '../Actions/UserDatasetUploadActions';

import UploadForm from '../Components/UploadForm';

import { StateSlice } from '../StoreModules/types';

const actionCreators = {
  showLoginForm,
  submitUploadForm,
};

type StateProps = Pick<StateSlice['userDatasetUpload'], 'badUploadMessage'> &
  Pick<StateSlice['globalData'], 'user'>;
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
    return this.props.user != null;
  }

  getTitle() {
    return 'Upload My New Data Set';
  }

  renderView() {
    return (
      <div className="stack">
        <UploadForm
          baseUrl={this.props.baseUrl}
          badUploadMessage={this.props.badUploadMessage}
          submitForm={this.props.userEvents.submitUploadForm}
          urlParams={this.props.urlParams}
        />
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
  }),
  actionCreators,
  (stateProps, dispatchProps, ownProps) => ({
    ...stateProps,
    ...ownProps,
    userEvents: dispatchProps,
  })
);

export default enhance(UserDatasetUploadController);
