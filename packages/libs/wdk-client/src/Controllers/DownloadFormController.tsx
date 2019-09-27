import * as React from 'react';
import { connect } from 'react-redux';
import { isEqual } from 'lodash';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';
import PageController from 'wdk-client/Core/Controllers/PageController';
import {
  loadPageDataFromRecord,
  loadPageDataFromStepId,
  selectReporter,
  updateForm,
  updateFormUi,
  submitForm
} from 'wdk-client/Actions/DownloadFormActions';
import DownloadFormContainer from 'wdk-client/Views/ReporterForm/DownloadFormContainer';
import { RootState } from 'wdk-client/Core/State/Types';

const DownloadFormActionCreators = {
  loadPageDataFromRecord,
  loadPageDataFromStepId,
  selectReporter,
  submitForm,
  updateFormState: updateForm,
  updateFormUiState: updateFormUi
};

type Options = Partial<{
  format: string;
  summaryView: string;
}>;

type OwnProps =
  | ({ recordClass: string; primaryKey: string; } & Options)
  | ({ stepId: number; } & Options)

type StateProps = RootState['downloadForm'];

type DispatchProps = typeof DownloadFormActionCreators;

type Props = { ownProps: OwnProps } & DispatchProps & StateProps;

class DownloadFormController extends PageController<Props> {

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
    };
    return ( <DownloadFormContainer {...formProps}/> );
  }

  loadData(prevProps: Props) {

    const { ownProps, loadPageDataFromRecord, loadPageDataFromStepId } = this.props;

    if (prevProps && isEqual(ownProps, prevProps.ownProps)) return;

    // must reinitialize with every new props
    if ('stepId' in ownProps) {
      loadPageDataFromStepId(ownProps.stepId, ownProps.format);
    }
    else if ('recordClass' in ownProps) {
      loadPageDataFromRecord(
          ownProps.recordClass, ownProps.primaryKey.split('/').join(','), ownProps.format);
    }
    else {
      console.error("Neither stepId nor recordClass param was passed " +
          "to StepDownloadFormController component");
    }
  }
}

const enhance = connect<StateProps, DispatchProps, OwnProps, Props, RootState>(
  state => state.downloadForm,
  DownloadFormActionCreators,
  (stateProps: StateProps, dispatchProps: DispatchProps, ownProps: OwnProps) => ({
    ...stateProps, ...dispatchProps, ownProps
  })
);

export default enhance(wrappable(DownloadFormController));
