import { connect } from 'react-redux';

import { Loading } from '@veupathdb/wdk-client/lib/Components';
import {
  safeHtml,
  renderAttributeValue,
} from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import ViewController from '@veupathdb/wdk-client/lib/Core/Controllers/ViewController';
import { ContentError } from '@veupathdb/wdk-client/lib/Components/PageStatus/ContentError';
import { ResultType } from '@veupathdb/wdk-client/lib/Utils/WdkResult';

import {
  requestBlastSummaryReport,
  fulfillBlastSummaryReport,
} from '../Actions/BlastSummaryViewActions';
import * as blastSummaryViewStoreModule from '../StoreModules/BlastSummaryViewStoreModule';

interface StateSlice {
  [blastSummaryViewStoreModule.key]: blastSummaryViewStoreModule.State;
}

const actionCreators = {
  requestBlastSummaryReport,
  fulfillBlastSummaryReport,
};

type StateProps = blastSummaryViewStoreModule.State[number];
type DispatchProps = typeof actionCreators;
type OwnProps = { viewId: string; resultType: ResultType };

type Props = OwnProps & DispatchProps & StateProps;

class BlastSummaryViewController extends ViewController<Props> {
  isRenderDataLoaded() {
    return this.props.blastSummaryData != null;
  }

  loadData(prevProps?: Props) {
    if (prevProps == null || prevProps.resultType !== this.props.resultType) {
      this.props.requestBlastSummaryReport(
        this.props.viewId,
        this.props.resultType
      );
    }
  }

  isRenderDataLoadError() {
    return this.props.errorMessage != null;
  }

  renderDataLoadError() {
    return <ContentError>{this.props.errorMessage!}</ContentError>;
  }

  renderView() {
    if (this.props.blastSummaryData == null) return <Loading />;

    return (
      <div>
        <pre>{safeHtml(this.props.blastSummaryData.blastMeta.blastHeader)}</pre>

        {this.props.blastSummaryData.records.map((record) => (
          <pre>{renderAttributeValue(record.attributes.summary)}</pre>
        ))}

        <pre>{safeHtml(this.props.blastSummaryData.blastMeta.blastMiddle)}</pre>

        {this.props.blastSummaryData.records.map((record) => (
          <pre>{renderAttributeValue(record.attributes.alignment)}</pre>
        ))}

        <pre>{safeHtml(this.props.blastSummaryData.blastMeta.blastFooter)}</pre>
      </div>
    );
  }
}

const mapStateToProps = (state: StateSlice, props: OwnProps) =>
  state.blastSummaryView[props.viewId];

export default connect<StateProps, DispatchProps, OwnProps, StateSlice>(
  mapStateToProps,
  actionCreators
)(BlastSummaryViewController);
