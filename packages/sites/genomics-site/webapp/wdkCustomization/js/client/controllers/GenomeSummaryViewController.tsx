import * as React from 'react';

import { connect } from 'react-redux';
import { Dispatch, bindActionCreators } from 'redux';

import { get, partial } from 'lodash';
import { createSelector } from 'reselect';
import { identity } from 'rxjs';

import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { ContentError } from '@veupathdb/wdk-client/lib/Components/PageStatus/ContentError';
import LoadError from '@veupathdb/wdk-client/lib/Components/PageStatus/LoadError';
import ViewController from '@veupathdb/wdk-client/lib/Core/Controllers/ViewController';
import { Partial1 } from '@veupathdb/wdk-client/lib/Utils/ActionCreatorUtils';
import { wrappable } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { ResultType } from '@veupathdb/wdk-client/lib/Utils/WdkResult';

import {
  requestGenomeSummaryReport,
  showRegionDialog,
  hideRegionDialog,
  applyEmptyChromosomesFilter,
  unapplyEmptyChromosomesFilter,
} from '../actions/GenomeSummaryViewActions';

import { GenomeSummaryView } from '../components/genomeSummaryView/GenomeSummaryView';

import * as genomeSummaryViewStoreModule from '../storeModules/GenomeSummaryViewStoreModule';

import { GenomeSummaryViewReport } from '../types/genomeSummaryViewTypes';

import {
  GenomeSummaryViewReportModel,
  toReportModel,
} from '../util/GenomeSummaryViewUtils';

interface StateSlice {
  [genomeSummaryViewStoreModule.key]: genomeSummaryViewStoreModule.State;
}

type StateProps =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | {
      status: 'complete';
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

type OwnProps = { viewId: string; resultType: ResultType };

type Props = {
  state: StateProps;
  actionCreators: DispatchProps;
  ownProps: OwnProps;
};

class GenomeSummaryViewController extends ViewController<Props> {
  isRenderDataLoaded() {
    return this.props.state.status !== 'loading';
  }

  loadData(prevProps?: Props) {
    if (
      prevProps == null ||
      prevProps.ownProps.resultType !== this.props.ownProps.resultType
    ) {
      this.props.actionCreators.requestGenomeSummaryReport(
        this.props.ownProps.resultType
      );
    }
  }

  isRenderDataLoadError() {
    return this.props.state.status === 'error';
  }

  renderDataLoadError() {
    if (this.props.state.status === 'error') {
      return <ContentError>{this.props.state.message}</ContentError>;
    }
    return <LoadError />;
  }

  renderView() {
    if (this.props.state.status === 'error') return <LoadError />;
    if (
      this.props.state.status == 'loading' ||
      this.props.state.genomeSummaryData == null
    )
      return <Loading />;

    return (
      <GenomeSummaryView
        genomeSummaryData={this.props.state.genomeSummaryData}
        displayName={this.props.state.displayName}
        displayNamePlural={this.props.state.displayNamePlural}
        regionDialogVisibilities={this.props.state.regionDialogVisibilities}
        emptyChromosomeFilterApplied={
          this.props.state.emptyChromosomeFilterApplied
        }
        recordType={this.props.state.recordType}
        showRegionDialog={this.props.actionCreators.showRegionDialog}
        hideRegionDialog={this.props.actionCreators.hideRegionDialog}
        applyEmptyChromosomeFilter={
          this.props.actionCreators.applyEmptyChromosomesFilter
        }
        unapplyEmptyChromosomeFilter={
          this.props.actionCreators.unapplyEmptyChromosomesFilter
        }
      />
    );
  }
}

// Records of type 'transcript' are handled by the gene page
const urlSegmentToRecordType = (urlSegment: string) =>
  urlSegment === 'transcript' ? 'gene' : urlSegment;

const reportModel = createSelector<
  GenomeSummaryViewReport,
  GenomeSummaryViewReport,
  GenomeSummaryViewReportModel
>(identity, toReportModel);

function mapStateToProps(state: StateSlice, props: OwnProps): StateProps {
  const genomeSummaryViewState = state.genomeSummaryView[props.viewId];

  if (genomeSummaryViewState == null) return { status: 'loading' };

  if (genomeSummaryViewState.errorMessage != null)
    return {
      status: 'error',
      message: genomeSummaryViewState.errorMessage,
    };

  return {
    status: 'complete',
    genomeSummaryData: genomeSummaryViewState.genomeSummaryData
      ? reportModel(genomeSummaryViewState.genomeSummaryData)
      : undefined,
    displayName: get(genomeSummaryViewState, 'recordClass.displayName', ''),
    displayNamePlural: get(
      genomeSummaryViewState,
      'recordClass.displayNamePlural',
      ''
    ),
    recordType: urlSegmentToRecordType(
      get(genomeSummaryViewState, 'recordClass.urlSegment', '')
    ),
    regionDialogVisibilities: genomeSummaryViewState.regionDialogVisibilities,
    emptyChromosomeFilterApplied:
      genomeSummaryViewState.emptyChromosomeFilterApplied,
  };
}

function mapDispatchToProps(
  dispatch: Dispatch,
  props: OwnProps
): DispatchProps {
  return bindActionCreators(
    {
      requestGenomeSummaryReport: partial(
        requestGenomeSummaryReport,
        props.viewId
      ),
      showRegionDialog: partial(showRegionDialog, props.viewId),
      hideRegionDialog: partial(hideRegionDialog, props.viewId),
      applyEmptyChromosomesFilter: partial(
        applyEmptyChromosomesFilter,
        props.viewId
      ),
      unapplyEmptyChromosomesFilter: partial(
        unapplyEmptyChromosomesFilter,
        props.viewId
      ),
    },
    dispatch
  );
}

export default connect<StateProps, DispatchProps, OwnProps, Props, StateSlice>(
  mapStateToProps,
  mapDispatchToProps,
  (state, actionCreators, ownProps) => ({ state, actionCreators, ownProps })
)(wrappable(GenomeSummaryViewController));
