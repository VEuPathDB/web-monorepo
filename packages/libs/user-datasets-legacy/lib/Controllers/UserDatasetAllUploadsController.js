import { jsx as _jsx } from 'react/jsx-runtime';
import { connect } from 'react-redux';
import PageController from '@veupathdb/wdk-client/lib/Core/Controllers/PageController';
import { showLoginForm } from '@veupathdb/wdk-client/lib/Actions/UserSessionActions';
import {
  requestUploadMessages,
  cancelCurrentUpload,
  clearMessages,
} from '../Actions/UserDatasetUploadActions';
import AllUploads from '../Components/AllUploads';
const actionCreators = {
  showLoginForm,
  requestUploadMessages,
  cancelCurrentUpload,
  clearMessages,
};
class UserDatasetAllUploadsController extends PageController {
  loadData(prevProps) {
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
    var _a;
    return _jsx(
      'div',
      Object.assign(
        { className: 'stack' },
        {
          children: _jsx(AllUploads, {
            baseUrl: this.props.baseUrl,
            errorMessage:
              (_a = this.props.badAllUploadsActionMessage) === null ||
              _a === void 0
                ? void 0
                : _a.message,
            uploadList: this.props.uploads,
            actions: this.props.actions,
          }),
        }
      )
    );
  }
}
const enhance = connect(
  (state) => ({
    badAllUploadsActionMessage:
      state.userDatasetUpload.badAllUploadsActionMessage,
    uploads: state.userDatasetUpload.uploads,
    user: state.globalData.user,
  }),
  actionCreators,
  (stateProps, dispatchProps, ownProps) =>
    Object.assign(
      Object.assign(Object.assign({}, stateProps), { actions: dispatchProps }),
      ownProps
    )
);
export default enhance(UserDatasetAllUploadsController);
//# sourceMappingURL=UserDatasetAllUploadsController.js.map
