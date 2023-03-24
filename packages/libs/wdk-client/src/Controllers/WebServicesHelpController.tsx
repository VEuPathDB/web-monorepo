import * as React from 'react';
import { connect } from 'react-redux';
import { wrappable } from '../Utils/ComponentUtils';
import PageController from '../Core/Controllers/PageController';
import {
  loadPageDataFromSearchConfig,
  selectReporter,
  updateForm,
  updateFormUi,
  submitForm,
} from '../Actions/DownloadFormActions';
import { RootState } from '../Core/State/Types';
import WebServicesHelp from '../Components/WebServicesHelp/WebServicesHelp';
import { STANDARD_REPORTER_NAME } from '../Views/ReporterForm/reporterUtils';

const WebServicesHelpActionCreators = {
  loadPageDataFromSearchConfig,
  selectReporter,
  submitForm,
  updateFormState: updateForm,
  updateFormUiState: updateFormUi,
};

type OwnProps = Record<string, string>;

type StateProps = RootState['downloadForm'];

type DispatchProps = typeof WebServicesHelpActionCreators;

export type Props = { ownProps: OwnProps } & DispatchProps & StateProps;

class WebServicesHelpController extends PageController<Props> {
  isRenderDataLoaded() {
    return this.props.resultType != null && !this.props.isLoading;
  }

  isRenderDataLoadError() {
    return (
      this.props.error != null &&
      this.props.error.status !== 403 &&
      this.props.error.status !== 404
    );
  }

  isRenderDataNotFound() {
    return this.props.error != null && this.props.error.status === 404;
  }

  isRenderDataPermissionDenied() {
    return this.props.error != null && this.props.error.status === 403;
  }

  getTitle() {
    return !this.isRenderDataLoaded() ? 'Loading...' : 'Web Services Tutorial';
  }

  renderView() {
    return <WebServicesHelp {...this.props} />;
  }

  loadData(prevProps?: Props) {
    const { ownProps, loadPageDataFromSearchConfig } = this.props;

    if (prevProps != null) return;

    // must reinitialize with every new props
    if ('searchName' in ownProps && 'weight' in ownProps) {
      loadPageDataFromSearchConfig(
        ownProps.searchName,
        ownProps,
        +ownProps.weight,
        STANDARD_REPORTER_NAME
      );
    } else {
      console.error(
        "Query string does not contain both 'searchName' and 'weight'."
      );
    }
  }
}

const enhance = connect<StateProps, DispatchProps, OwnProps, Props, RootState>(
  (state) => state.downloadForm,
  WebServicesHelpActionCreators,
  (
    stateProps: StateProps,
    dispatchProps: DispatchProps,
    ownProps: OwnProps
  ) => ({
    ...stateProps,
    ...dispatchProps,
    ownProps,
  })
);

export default enhance(wrappable(WebServicesHelpController));
