import * as React from 'react';
import { connect } from 'react-redux';

import ViewController from 'wdk-client/Core/Controllers/ViewController';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';
import { Loading } from 'wdk-client/Components';
import LoadError from 'wdk-client/Components/PageStatus/LoadError';
import { RootState } from 'wdk-client/Core/State/Types';
import * as actionCreators from 'wdk-client/Actions/SummaryView/GenomeSummaryViewActions';
import { GenomeSummaryView } from 'wdk-client/Components/GenomeSummaryView/GenomeSummaryView';
import { get, toLower } from 'lodash';
import { GenomeSummaryViewReport } from 'wdk-client/Utils/WdkModel';
import { createSelector } from 'reselect';
import { GenomeSummaryViewReportModel, toReportModel } from 'wdk-client/Utils/GenomeSummaryViewUtils';
import { identity } from 'rxjs';

type StateProps = {
  genomeSummaryData?: GenomeSummaryViewReportModel;
  displayName: string;
  displayNamePlural: string;
  webAppUrl: string;
  siteName: string;
  recordType: string;
  regionDialogVisibilities: Record<string, boolean>;
  emptyChromosomeFilterApplied: boolean;
};

type DispatchProps = typeof actionCreators;
type OwnProps = { stepId: number };
type Props = OwnProps & StateProps & DispatchProps;

class GenomeSummaryViewController extends ViewController< Props > {

  isRenderDataLoaded() {
    return this.props.genomeSummaryData != null;
  }

  loadData () {
    if (this.props.genomeSummaryData == null) {
      this.props.requestGenomeSummaryReport(this.props.stepId);
    }
  }

  isRenderDataLoadError() {
    return false; // TODO: fix this
  }

  renderDataLoadError() {
    return <LoadError/>;  // TODO: make this better
  }

  renderView() {
    if (this.props.genomeSummaryData == null) return <Loading/>;

    return (
      <GenomeSummaryView  
        genomeSummaryData={this.props.genomeSummaryData}
        displayName={this.props.displayName}
        displayNamePlural={this.props.displayNamePlural}
        regionDialogVisibilities={this.props.regionDialogVisibilities}
        emptyChromosomeFilterApplied={this.props.emptyChromosomeFilterApplied}
        webAppUrl={this.props.webAppUrl}
        siteName={this.props.siteName}
        recordType={this.props.recordType}
        showRegionDialog={this.props.showRegionDialog}
        hideRegionDialog={this.props.hideRegionDialog}
        applyEmptyChromosomeFilter={this.props.applyEmptyChromosomesFilter}
        unapplyEmptyChromosomeFilter={this.props.unapplyEmptyChromosomesFilter}
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

const mapStateToProps = ({
  genomeSummaryView: genomeSummaryViewState,
  globalData: globalDataState
}: RootState): StateProps => ({
  genomeSummaryData: genomeSummaryViewState.genomeSummaryData
    ? reportModel(genomeSummaryViewState.genomeSummaryData)
    : undefined,
  displayName: get(genomeSummaryViewState, 'recordClass.displayName', ''),
  displayNamePlural: get(genomeSummaryViewState, 'recordClass.displayNamePlural', ''),
  recordType: urlSegmentToRecordType(get(genomeSummaryViewState, 'recordClass.urlSegment', '')),
  siteName: toLower(get(globalDataState, 'siteConfig.projectId', '')),
  webAppUrl: get(globalDataState, 'siteConfig.webAppUrl', ''),
  regionDialogVisibilities: genomeSummaryViewState.regionDialogVisibilities,
  emptyChromosomeFilterApplied: genomeSummaryViewState.emptyChromosomeFilterApplied
});

export default connect(
  mapStateToProps,
  actionCreators
) (wrappable(GenomeSummaryViewController));

