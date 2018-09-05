import './AttributeAnalysis.scss';

import React from 'react';

import Loading from '../../Components/Loading/Loading';
import Dialog from '../../Components/Overlays/Dialog';
import Error from '../../Components/PageStatus/Error';
import { Action } from '../../Utils/ActionCreatorUtils';
import { makeClassNameHelper } from '../../Utils/ComponentUtils';
import { Reporter } from '../../Utils/WdkModel';

import { AttributeReportCancelled, AttributeReportRequested } from './BaseAttributeAnalysis/BaseAttributeAnalysisActions';
import { State } from './BaseAttributeAnalysis/BaseAttributeAnalysisState';

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
