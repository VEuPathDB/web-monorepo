import * as React from 'react';
import { connect } from 'react-redux';
import { isEqual } from 'lodash';
import { wrappable } from '../Utils/ComponentUtils';
import PageController from '../Core/Controllers/PageController';
import {
  loadPageDataFromRecord,
  loadPageDataFromBasketName,
  loadPageDataFromStepId,
  selectReporter,
  updateForm,
  updateFormUi,
  submitForm,
  updateViewFilters,
} from '../Actions/DownloadFormActions';
import DownloadFormContainer from '../Views/ReporterForm/DownloadFormContainer';
import { RootState } from '../Core/State/Types';

const DownloadFormActionCreators = {
  loadPageDataFromRecord,
  loadPageDataFromBasketName,
  loadPageDataFromStepId,
  selectReporter,
  submitForm,
  updateFormState: updateForm,
  updateFormUiState: updateFormUi,
  updateViewFilters,
};

type Options = Partial<{
  format: string;
  summaryView: string;
}>;

type OwnProps =
  | ({ basketName: string } & Options)
  | ({ recordClass: string; primaryKey: string } & Options)
  | ({ stepId: number } & Options);

type StateProps = RootState['downloadForm'];

type DispatchProps = typeof DownloadFormActionCreators;

type Props = { ownProps: OwnProps } & DispatchProps & StateProps;

class DownloadFormController extends PageController<Props> {
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
    const { resultType } = this.props;
    const displayName =
      resultType == null
        ? 'Results'
        : resultType.type === 'step'
        ? resultType.step.displayName
        : resultType.type === 'basket'
        ? 'Basket'
        : 'Results';
    return !this.isRenderDataLoaded()
      ? 'Loading...'
      : 'Download: ' + displayName;
  }

  renderView() {
    // build props object to pass to form component
    let formProps = {
      ...this.props,
    };
    return (
      <DownloadFormContainer
        {...formProps}
        includeTitle={true}
        includeSubmit={true}
      />
    );
  }

  loadData(prevProps: Props) {
    const {
      ownProps,
      loadPageDataFromRecord,
      loadPageDataFromStepId,
      loadPageDataFromBasketName,
    } = this.props;

    if (prevProps && isEqual(ownProps, prevProps.ownProps)) return;

    // must reinitialize with every new props
    if ('stepId' in ownProps) {
      loadPageDataFromStepId(ownProps.stepId, ownProps.format);
    } else if ('recordClass' in ownProps) {
      loadPageDataFromRecord(
        ownProps.recordClass,
        ownProps.primaryKey.split('/').join(','),
        ownProps.format
      );
    } else if ('basketName' in ownProps) {
      loadPageDataFromBasketName(ownProps.basketName, ownProps.format);
    } else {
      console.error(
        'Neither stepId nor recordClass param was passed ' +
          'to StepDownloadFormController component'
      );
    }
  }
}

const enhance = connect<StateProps, DispatchProps, OwnProps, Props, RootState>(
  (state) => state.downloadForm,
  DownloadFormActionCreators,
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

export default enhance(wrappable(DownloadFormController));
