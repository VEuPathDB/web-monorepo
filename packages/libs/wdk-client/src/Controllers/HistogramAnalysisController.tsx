import { identity } from 'lodash/fp';
import React from 'react';
import { connect } from 'react-redux';

import { Loading } from '../Components';
import { RootState } from '../Core/State/Types';
import AttributeAnalysisTabs from '../Views/AttributeAnalysis/AttributeAnalysisTabs';
import {
  openView,
  setBinSize,
  enableLogScaleXAxis,
  enableLogScaleYAxis,
  closeView,
} from '../Actions/HistogramAnalysisActions';
import { Dispatch } from 'redux';
import { Histogram } from '../Views/AttributeAnalysis/HistogramAnalysis/HistogramAnalysis';
import {
  getReportSummary,
  getDefaultBinSize,
  HistogramReport,
} from '../Views/AttributeAnalysis/HistogramAnalysis/HistogramAnalysisUtils';
import { ResultType } from '../Utils/WdkResult';

interface OwnProps {
  resultType: ResultType;
  reporterType: string;
  attributeName: string;
}

type StateProps = Pick<RootState, 'attributeAnalysis' | 'histogramAnalysis'>;

interface DispatchProps {
  openView: typeof openView;
  closeView: typeof closeView;
  setBinSize: typeof setBinSize;
  enableLogScaleXAxis: typeof enableLogScaleXAxis;
  enableLogScaleYAxis: typeof enableLogScaleYAxis;
  dispatch: Dispatch;
}

type Props = OwnProps & DispatchProps & StateProps;

class HistogramAnalysisController extends React.PureComponent<Props> {
  componentDidMount() {
    const { openView, reporterType, resultType, attributeName } = this.props;
    const reporterName = `${attributeName}-${reporterType}`;
    openView(reporterName, resultType);
  }

  componentWillUnmount() {
    const { closeView, reporterType, resultType, attributeName } = this.props;
    const reporterName = `${attributeName}-${reporterType}`;
    closeView(reporterName, resultType);
  }

  render() {
    const {
      attributeAnalysis,
      histogramAnalysis,
      dispatch,
      setBinSize,
      enableLogScaleXAxis,
      enableLogScaleYAxis,
    } = this.props;

    const { report, table, activeTab } = attributeAnalysis;

    if (report.error)
      return <h3>Oops... something went wrong. Please try again later.</h3>;

    if (report.resource == null) return <Loading />;

    const histogramReport = report.resource as HistogramReport;

    const { avg, median, min, max } = getReportSummary(
      histogramReport,
      histogramAnalysis.logXAxis
    );
    const {
      binSize = getDefaultBinSize(histogramReport, histogramAnalysis.logXAxis),
    } = histogramAnalysis;

    const tableData = Object.entries(histogramReport.data).map(
      ([attrValue, recordCount]) => ({
        attrValue:
          histogramReport.type === 'category'
            ? String(attrValue)
            : Number(attrValue),
        recordCount: recordCount,
      })
    );

    return (
      <AttributeAnalysisTabs
        dispatch={dispatch}
        activeTab={activeTab}
        tableState={table}
        tableConfig={{
          columns: [
            { key: 'attrValue', display: histogramReport.attrLabel },
            { key: 'recordCount', display: histogramReport.recordCountLabel },
          ],
          data: tableData,
        }}
        visualizationConfig={{
          display: 'Histogram',
          content: (
            <Histogram
              attrLabel={histogramReport.attrLabel}
              recordCountLabel={histogramReport.recordCountLabel}
              data={histogramReport.data}
              avg={avg}
              median={median}
              min={min}
              max={max}
              type={histogramReport.type}
              logXAxis={histogramAnalysis.logXAxis}
              logYAxis={histogramAnalysis.logYAxis}
              binSize={binSize}
              onBinSizeChange={setBinSize}
              onLogScaleXAxisChange={enableLogScaleXAxis}
              onLogScaleYAxisChange={enableLogScaleYAxis}
            />
          ),
        }}
      />
    );
  }
}

function mapStateToProps(state: RootState): StateProps {
  const { attributeAnalysis, histogramAnalysis } = state;
  return { attributeAnalysis, histogramAnalysis };
}

const mapDispatchToProps = {
  dispatch: identity,
  openView,
  closeView,
  setBinSize,
  enableLogScaleXAxis,
  enableLogScaleYAxis,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HistogramAnalysisController);
