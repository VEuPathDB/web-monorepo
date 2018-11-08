import 'wdk-client/Views/AttributeAnalysis/AttributeAnalysis.scss';

import React from 'react';
import { Action } from 'redux';

import Loading from 'wdk-client/Components/Loading/Loading';
import Dialog from 'wdk-client/Components/Overlays/Dialog';
import Error from 'wdk-client/Components/PageStatus/Error';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import { Reporter } from 'wdk-client/Utils/WdkModel';

import { startAttributeReportRequest, cancelAttributeReportRequest } from 'wdk-client/Actions/AttributeAnalysisActions';
import { State } from 'wdk-client/StoreModules/AttributeAnalysisStoreModule/BaseAttributeAnalysis';

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
    this.props.dispatch(startAttributeReportRequest(
      this.props.stepId,
      this.props.reporter.name,
    ));
  }

  unloadReport = () => {
    this.props.dispatch(cancelAttributeReportRequest());
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
