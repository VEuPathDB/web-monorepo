import * as React from 'react';
import { connect } from 'react-redux';
import { wrappable } from '../../Utils/ComponentUtils';
import PageController from '../../Core/Controllers/PageController';
import * as DownloadFormActionCreators from './DownloadFormActionCreators';
import DownloadFormContainer from './DownloadFormContainer';
import { RootState } from '../../Core/State/Types';

class DownloadFormController extends PageController<RootState['downloadForm'] & typeof DownloadFormActionCreators> {

  isRenderDataLoaded() {
    return (this.props.step != null && !this.props.isLoading);
  }

  isRenderDataLoadError() {
    return (
      this.props.error != null &&
      this.props.error.status !== 403 &&
      this.props.error.status !== 404
    );
  }

  isRenderDataNotFound() {
    return (
      this.props.error != null &&
      this.props.error.status === 404
    );
  }

  isRenderDataPermissionDenied() {
    return (
      this.props.error != null &&
      this.props.error.status === 403
    );
  }

  getTitle() {
    return (!this.isRenderDataLoaded() ? "Loading..." :
      "Download: " + this.props.step!.displayName);
  }

  renderView() {
    // build props object to pass to form component
    let formProps = {
      ...this.props,
      // passing summary view in case reporters handle view links differently
      summaryView: this.getQueryParams().summaryView
    };
    return ( <DownloadFormContainer {...formProps}/> );
  }

  loadData() {
    // must reinitialize with every new props
    let { params } = this.props.match;
    if ('stepId' in params) {
      this.props.loadPageDataFromStepId(params.stepId, this.getQueryParams().format);
    }
    else if ('recordClass' in params) {
      this.props.loadPageDataFromRecord(
          params.recordClass, params.primaryKey.split('/').join(','), this.getQueryParams().format);
    }
    else {
      console.error("Neither stepId nor recordClass param was passed " +
          "to StepDownloadFormController component");
    }
  }
}

const enhance = connect(
  (state: RootState) => state.downloadForm,
  DownloadFormActionCreators
);

export default enhance(wrappable(DownloadFormController));
