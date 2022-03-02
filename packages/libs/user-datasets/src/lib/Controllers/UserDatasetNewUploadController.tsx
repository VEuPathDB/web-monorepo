import { connect } from 'react-redux';

import { wrappable } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import PageController from '@veupathdb/wdk-client/lib/Core/Controllers/PageController';
import MicrobiomeDBUploadForm from '@veupathdb/wdk-client/lib/Views/UserDatasets/MicrobiomeDBUploadForm';
import { showLoginForm } from '@veupathdb/wdk-client/lib/Actions/UserSessionActions';;
import { RootState } from '@veupathdb/wdk-client/lib/Core/State/Types';

import {
  submitUploadForm,
} from '../Actions/UserDatasetUploadActions';

import {
  State as UserDatasetUploadState,
} from '../StoreModules/UserDatasetUploadStoreModule'

const actionCreators = {
  showLoginForm,
  submitUploadForm,
};

interface StateSlice extends RootState {
  userDatasetUpload: UserDatasetUploadState;
}

type StateProps =
  Pick<StateSlice['userDatasetUpload'], 'badUploadMessage'>
  & Pick<StateSlice['globalData'], 'user'>
  & Pick<StateSlice['globalData'], 'config'>;
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

  renderView(){
    const projectName = this.props.config != null ? this.props.config.displayName : undefined;

    return (
      <div className="stack">
        { projectName === 'MicrobiomeDB'
          ? <MicrobiomeDBUploadForm badUploadMessage={this.props.badUploadMessage} submitForm={this.props.userEvents.submitUploadForm} urlParams={this.props.urlParams}/>
          : this.renderMissingForm()
        }
      </div>
    );
  }
}

const enhance = connect<StateProps, DispatchProps, OwnProps, MergedProps, StateSlice>(
  state => ({
    badUploadMessage: state.userDatasetUpload.badUploadMessage,
    user: state.globalData.user,
    config: state.globalData.config
  }),
  actionCreators,
  (stateProps, dispatchProps, ownProps) => ({ ...stateProps, ...ownProps, userEvents: dispatchProps })
)

export default enhance(wrappable(UserDatasetUploadController));
