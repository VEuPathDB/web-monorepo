import 'wdk-client/Views/AttributeAnalysis/AttributeAnalysis.scss';

import React from 'react';

import Loading from 'wdk-client/Components/Loading/Loading';
import Dialog from 'wdk-client/Components/Overlays/Dialog';
import Error from 'wdk-client/Components/PageStatus/Error';
import { Action } from 'wdk-client/Utils/ActionCreatorUtils';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import { Reporter } from 'wdk-client/Utils/WdkModel';

import { AttributeReportCancelled, AttributeReportRequested } from 'wdk-client/Views/AttributeAnalysis/BaseAttributeAnalysis/BaseAttributeAnalysisActions';
import { State } from 'wdk-client/Views/AttributeAnalysis/BaseAttributeAnalysis/BaseAttributeAnalysisState';

const cx = makeClassNameHelper('AttributeAnalysis');

type Props = {
  stepId: number;
  reporter: Reporter;
  recordClassName: string;
  dispatch: (action: Action) => void;
  analysis?: State<string>;
}

export default class AttributeAnalysisButton extends React.Component<Props> {

  loadReport = () => {
    this.props.dispatch(AttributeReportRequested.create({
      reporterName: this.props.reporter.name,
      stepId: this.props.stepId,
    }));
  }

  unloadReport = () => {
    this.props.dispatch(AttributeReportCancelled.create());
  }

  render() {
    const { dispatch, reporter, analysis, children } = this.props;
    const title = `Analyze/Graph the contents of this column by ${reporter.displayName.toLowerCase()}`;

    return (
      <React.Fragment>
        <button className={cx('Button')} type="button" title={title} onClick={this.loadReport}/>
        <Dialog
          modal={true}
          open={analysis != null && analysis.data.status !== 'idle'}
          onClose={() => this.unloadReport()}
          className={cx()}
          title={reporter.displayName}
        >
          { analysis == null ? null
          : analysis.data.status === 'success' ? children
          : analysis.data.status === 'error' ? <Error/>
          : /* analysis.data.status = 'fetching' */ <Loading/>
          }
        </Dialog>
      </React.Fragment>
    );
  }

}
