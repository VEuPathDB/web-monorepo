import * as React from 'react';
import { connect } from 'react-redux';

import ViewController from 'wdk-client/Core/Controllers/ViewController';
import { safeHtml, wrappable, renderAttributeValue } from 'wdk-client/Utils/ComponentUtils';
import { Loading } from 'wdk-client/Components';
import { RootState } from 'wdk-client/Core/State/Types';
import {requestBlastSummaryReport, fulfillBlastSummaryReport} from 'wdk-client/Actions/SummaryView/BlastSummaryViewActions';
import {State} from 'wdk-client/StoreModules/BlastSummaryViewStoreModule';
import LoadError from 'wdk-client/Components/PageStatus/LoadError';
import {ResultType} from 'wdk-client/Utils/WdkResult';
import { ContentError } from 'wdk-client/Components/PageStatus/ContentError';


const actionCreators = {
  requestBlastSummaryReport,
  fulfillBlastSummaryReport
};

type StateProps = State[number];
type DispatchProps = typeof actionCreators;
type OwnProps = { viewId: string, resultType: ResultType };

type Props = OwnProps & DispatchProps & StateProps;

class BlastSummaryViewController extends ViewController< Props > {

  isRenderDataLoaded() {
    return this.props.blastSummaryData != null;
  }

  loadData (prevProps?: Props) {
    if (prevProps == null || prevProps.resultType !== this.props.resultType) {
      this.props.requestBlastSummaryReport(this.props.viewId, this.props.resultType);
    }
  }

  isRenderDataLoadError() {
    return this.props.errorMessage != null;
  }

  renderDataLoadError() {
    return (
      <ContentError>
        {this.props.errorMessage!}
      </ContentError>
    );
  }

  renderView() {
    if (this.props.blastSummaryData == null) return <Loading/>;

    return (
      <div>
      <pre>{safeHtml(this.props.blastSummaryData.blastMeta.blastHeader)}</pre>

      {this.props.blastSummaryData.records.map((record => <pre>{renderAttributeValue(record.attributes.summary)}</pre>))}

      <pre>{safeHtml(this.props.blastSummaryData.blastMeta.blastMiddle)}</pre>

      {this.props.blastSummaryData.records.map((record => <pre>{renderAttributeValue(record.attributes.alignment)}</pre>))}

      <pre>{safeHtml(this.props.blastSummaryData.blastMeta.blastFooter)}</pre>
      </div>
       
    );
  }
}

const mapStateToProps = (state: RootState, props: OwnProps) => state.blastSummaryView[props.viewId];

export default connect<StateProps, DispatchProps, OwnProps, RootState>(
  mapStateToProps,
  actionCreators
) (wrappable(BlastSummaryViewController));

