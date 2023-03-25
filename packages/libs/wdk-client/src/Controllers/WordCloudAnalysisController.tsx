import { get } from 'lodash';
import { identity } from 'lodash/fp';
import React from 'react';
import { connect } from 'react-redux';

import { Loading } from '../Components';

import { RootState } from '../Core/State/Types';
import AttributeAnalysisTabs from '../Views/AttributeAnalysis/AttributeAnalysisTabs';
import {
  WordCloud,
  Tag,
} from '../Views/AttributeAnalysis/WordCloudAnalysis/WordCloudAnalysis';
import {
  changeRankRange,
  changeSort,
  openView,
  closeView,
} from '../Actions/WordCloudAnalysisActions';
import { Dispatch } from 'redux';
import { ResultType } from '../Utils/WdkResult';

const DEFAULT_RANK_RANGE_MAX = 50;

interface OwnProps {
  resultType: ResultType;
  reporterType: string;
  attributeName: string;
}

type StateProps = Pick<RootState, 'attributeAnalysis' | 'wordCloudAnalysis'>;

interface DispatchProps {
  changeRankRange: typeof changeRankRange;
  changeSort: typeof changeSort;
  openView: typeof openView;
  closeView: typeof closeView;
  dispatch: Dispatch;
}

type Props = OwnProps & DispatchProps & StateProps;

class WordCloudAnalysisController extends React.PureComponent<Props> {
  componentDidMount() {
    const { reporterType, resultType, attributeName, openView } = this.props;
    const reporterName = `${attributeName}-${reporterType}`;
    openView(reporterName, resultType);
  }

  componentWillUnmount() {
    const { reporterType, resultType, attributeName, closeView } = this.props;
    const reporterName = `${attributeName}-${reporterType}`;
    closeView(reporterName, resultType);
  }

  render() {
    const {
      attributeAnalysis,
      wordCloudAnalysis,
      dispatch,
      changeRankRange,
      changeSort,
    } = this.props;

    const { report, table, activeTab } = attributeAnalysis;

    if (report.error)
      return <h3>Oops... something went wrong. Please try again later.</h3>;

    if (report.resource == null) return <Loading />;

    const tags: Tag[] = get(report.resource, 'tags', []);

    const {
      rankRange = {
        min: 1,
        max: Math.min(DEFAULT_RANK_RANGE_MAX, tags.length),
      },
      wordCloudSort: sort = 'rank',
    } = wordCloudAnalysis;

    return (
      <AttributeAnalysisTabs
        dispatch={dispatch}
        activeTab={activeTab}
        tableState={table}
        tableConfig={{
          columns: [
            { key: 'word', display: 'Word' },
            { key: 'count', display: 'Occurrence' },
          ],
          data: tags,
        }}
        visualizationConfig={{
          display: 'Word Cloud',
          content: (
            <WordCloud
              tags={tags}
              rankRange={rankRange}
              sort={sort}
              onRankRangeChange={changeRankRange}
              onSortChange={changeSort}
            />
          ),
        }}
      />
    );
  }
}

function mapStateToProps(state: RootState): StateProps {
  const { attributeAnalysis, wordCloudAnalysis } = state;
  return { attributeAnalysis, wordCloudAnalysis };
}

const mapDispatchToProps = {
  dispatch: identity,
  openView,
  closeView,
  changeRankRange,
  changeSort,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WordCloudAnalysisController);
