import { partial } from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch, bindActionCreators } from 'redux';

import ViewController from 'wdk-client/Core/Controllers/ViewController';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';
import { Loading } from 'wdk-client/Components';
import LoadError from 'wdk-client/Components/PageStatus/LoadError';
import { RootState } from 'wdk-client/Core/State/Types';
import {
  requestGenomeSummaryReport,
  showRegionDialog,
  hideRegionDialog,
  applyEmptyChromosomesFilter,
  unapplyEmptyChromosomesFilter
} from 'wdk-client/Actions/SummaryView/GenomeSummaryViewActions';
import { GenomeSummaryView } from 'wdk-client/Components/GenomeSummaryView/GenomeSummaryView';
import { get, toLower } from 'lodash';
import { GenomeSummaryViewReport } from 'wdk-client/Utils/WdkModel';
import { createSelector } from 'reselect';
import { GenomeSummaryViewReportModel, toReportModel } from 'wdk-client/Utils/GenomeSummaryViewUtils';
import { identity } from 'rxjs';
import { Partial1 } from 'wdk-client/Utils/ActionCreatorUtils';
import {ResultType} from 'wdk-client/Utils/WdkResult';
import { ContentError } from 'wdk-client/Components/PageStatus/ContentError';

type StateProps = 
  | { status: 'loading' }
  | { status: 'error', message: string }
  | {
    status: 'complete'
    genomeSummaryData?: GenomeSummaryViewReportModel;
    displayName: string;
    displayNamePlural: string;
    recordType: string;
    regionDialogVisibilities: Record<string, boolean>;
    emptyChromosomeFilterApplied: boolean;
  };

type DispatchProps = {
  requestGenomeSummaryReport: Partial1<typeof requestGenomeSummaryReport>;
  showRegionDialog: Partial1<typeof showRegionDialog>;
  hideRegionDialog: Partial1<typeof hideRegionDialog>;
  applyEmptyChromosomesFilter: Partial1<typeof applyEmptyChromosomesFilter>;
  unapplyEmptyChromosomesFilter: Partial1<typeof unapplyEmptyChromosomesFilter>;
};

type OwnProps = { viewId: string, resultType: ResultType };

type Props = {
  state: StateProps,
  actionCreators: DispatchProps,
  ownProps: OwnProps
};

class GenomeSummaryViewController extends ViewController< Props > {

  isRenderDataLoaded() {
    return this.props.state.status !== 'loading';
  }

  loadData (prevProps?: Props) {
    if (prevProps == null || prevProps.ownProps.resultType !== this.props.ownProps.resultType) {
      this.props.actionCreators.requestGenomeSummaryReport(this.props.ownProps.resultType);
    }
  }

  isRenderDataLoadError() {
    return this.props.state.status === 'error';
  }

  renderDataLoadError() {
    if (this.props.state.status === 'error') {
      return <ContentError>{this.props.state.message}</ContentError>
    }
    return <LoadError/>
  }

  renderView() {
    if (this.props.state.status === 'error') return <LoadError/>;
    if (this.props.state.status == 'loading' || this.props.state.genomeSummaryData == null) return <Loading/>;

    return (
      <GenomeSummaryView  
        genomeSummaryData={this.props.state.genomeSummaryData}
        displayName={this.props.state.displayName}
        displayNamePlural={this.props.state.displayNamePlural}
        regionDialogVisibilities={this.props.state.regionDialogVisibilities}
        emptyChromosomeFilterApplied={this.props.state.emptyChromosomeFilterApplied}
        recordType={this.props.state.recordType}
        showRegionDialog={this.props.actionCreators.showRegionDialog}
        hideRegionDialog={this.props.actionCreators.hideRegionDialog}
        applyEmptyChromosomeFilter={this.props.actionCreators.applyEmptyChromosomesFilter}
        unapplyEmptyChromosomeFilter={this.props.actionCreators.unapplyEmptyChromosomesFilter}
      />
    );
  }
}

// Records of type 'transcript' are handled by the gene page
const urlSegmentToRecordType = (urlSegment: string) => urlSegment === 'transcript'
  ? 'gene'
  : urlSegment;

const reportModel = createSelector<GenomeSummaryViewReport, GenomeSummaryViewReport, GenomeSummaryViewReportModel>(
  identity,
  toReportModel
);

function mapStateToProps(state: RootState, props: OwnProps): StateProps {
  const genomeSummaryViewState = state.genomeSummaryView[props.viewId];
  const globalDataState = state.globalData;

  if (genomeSummaryViewState == null) return { status: 'loading' };

  if (genomeSummaryViewState.errorMessage != null) return {
    status: 'error',
    message: genomeSummaryViewState.errorMessage
  }

  return {
    status: 'complete',
    genomeSummaryData: genomeSummaryViewState.genomeSummaryData
      ? reportModel(genomeSummaryViewState.genomeSummaryData)
      : undefined,
    displayName: get(genomeSummaryViewState, 'recordClass.displayName', ''),
    displayNamePlural: get(genomeSummaryViewState, 'recordClass.displayNamePlural', ''),
    recordType: urlSegmentToRecordType(get(genomeSummaryViewState, 'recordClass.urlSegment', '')),
    regionDialogVisibilities: genomeSummaryViewState.regionDialogVisibilities,
    emptyChromosomeFilterApplied: genomeSummaryViewState.emptyChromosomeFilterApplied
  };
}

function mapDispatchToProps(dispatch: Dispatch, props: OwnProps): DispatchProps {
  return bindActionCreators({
    requestGenomeSummaryReport: partial(requestGenomeSummaryReport, props.viewId),
    showRegionDialog: partial(showRegionDialog, props.viewId),
    hideRegionDialog: partial(hideRegionDialog, props.viewId),
    applyEmptyChromosomesFilter: partial(applyEmptyChromosomesFilter, props.viewId),
    unapplyEmptyChromosomesFilter: partial(unapplyEmptyChromosomesFilter, props.viewId)
  }, dispatch);
}

export default connect<StateProps, DispatchProps, OwnProps, Props, RootState>(
  mapStateToProps,
  mapDispatchToProps,
  (state, actionCreators, ownProps) => ({ state, actionCreators, ownProps })
) (wrappable(GenomeSummaryViewController));

