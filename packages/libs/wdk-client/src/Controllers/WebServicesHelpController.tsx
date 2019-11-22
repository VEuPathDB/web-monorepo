import * as React from 'react';
import { connect } from 'react-redux';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';
import PageController from 'wdk-client/Core/Controllers/PageController';
import {
  loadPageDataFromSearchConfig,
  selectReporter,
  updateForm,
  updateFormUi,
  submitForm
} from 'wdk-client/Actions/DownloadFormActions';
import DownloadFormContainer from 'wdk-client/Views/ReporterForm/DownloadFormContainer';
import { RootState } from 'wdk-client/Core/State/Types';
import { reportAnswerFulfillmentError } from 'wdk-client/Actions/SummaryView/ResultTableSummaryViewActions';

const WebServicesHelpActionCreators = {
  loadPageDataFromSearchConfig,
  selectReporter,
  submitForm,
  updateFormState: updateForm,
  updateFormUiState: updateFormUi
};

type OwnProps = Record<string,string>;

type StateProps = RootState['downloadForm'];

type DispatchProps = typeof WebServicesHelpActionCreators;

type Props = { ownProps: OwnProps } & DispatchProps & StateProps;

class WebServicesHelpController extends PageController<Props> {

  isRenderDataLoaded() {
    return (this.props.resultType != null && !this.props.isLoading);
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
    return (!this.isRenderDataLoaded() ? "Loading..." : "Web Services Tutorial");
  }

  renderView() {
    // build props object to pass to form component
    let formProps = {
      ...this.props,
    };
    if (!formProps.resultType ||
        formProps.resultType.type != 'step' ||
        !formProps.recordClass) {
      return ( <div>This page cannot be rendered with the passed query parameters.</div> );
    }
    let reportName = formProps.selectedReporter || "?";
    let reportConfig = formProps.formState || "Not yet configured"
    let url = '/service/record-types/' +
       formProps.recordClass.urlSegment + '/searches/' +
       formProps.resultType.step.searchName + '/reports/' + reportName;
    let requestJson = JSON.stringify({
      searchConfig: formProps.resultType.step.searchConfig,
      reportConfig: reportConfig
    }, null, 2);
    return (
      <div>
        <h3>Coming Soon...</h3>
        <div>
          POST the following JSON to {url}
          <pre>
            {requestJson}
          </pre>
        </div>
        <DownloadFormContainer {...formProps}/>
      </div>
    );
  }

  loadData(prevProps?: Props) {
    const { ownProps, isLoading, resultType, loadPageDataFromSearchConfig } = this.props;

    if (prevProps != null) return;

    // must reinitialize with every new props
    if ('searchName' in ownProps && 'weight' in ownProps) {
      loadPageDataFromSearchConfig(ownProps.searchName, ownProps, +ownProps.weight);
    }
    else {
      console.error("Query string does not contain both 'searchName' and 'weight'.");
    }
  }
}

const enhance = connect<StateProps, DispatchProps, OwnProps, Props, RootState>(
  state => state.downloadForm,
  WebServicesHelpActionCreators,
  (stateProps: StateProps, dispatchProps: DispatchProps, ownProps: OwnProps) => ({
    ...stateProps, ...dispatchProps, ownProps
  })
);

export default enhance(wrappable(WebServicesHelpController));
