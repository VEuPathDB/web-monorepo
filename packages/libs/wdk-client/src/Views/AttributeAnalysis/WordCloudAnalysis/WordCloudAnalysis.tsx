import './WordCloudAnalysis.scss';

import { memoize } from 'lodash';
import React from 'react';

import NumberRangeSelector from '../../../Components/InputControls/NumberRangeSelector';
import RadioList from '../../../Components/InputControls/RadioList';
import { DispatchAction, SimpleDispatch } from '../../../Core/CommonTypes';
import { makeClassNameHelper, pure } from '../../../Utils/ComponentUtils';
import { Seq } from '../../../Utils/IterableUtils';

import { AttributeAnalysis } from '../BaseAttributeAnalysis/BaseAttributeAnalysis';
import { RankRange, RankRangeChanged, Sort, WordCloudSorted } from './WordCloudActions';
import { State } from './WordCloudState';

type Tag = { word: string; count: number };
type Column = { key: keyof Tag; display: string; }
type ModuleProps = {
  state: State;
  dispatch: SimpleDispatch;
}

const cx = makeClassNameHelper('WordCloudAnalysis');

const columns : Column[] = [
  { key: 'word', display: 'Word' },
  { key: 'count', display: 'Occurrence' }
];

export default class WordCloudAnalysis extends React.Component<ModuleProps> {

  onRankChange = (range: RankRange) =>
    this.props.dispatch(RankRangeChanged.create(range));

  onSortChange = (sort: string) =>
    this.props.dispatch(WordCloudSorted.create(sort as Sort));

  render() {
    if (this.props.state.data.status !== 'success') return null;

    return (
      <AttributeAnalysis
        {...this.props}
        visualizationConfig={{
          display: 'Word Cloud',
          content: (
            <WordCloud
              {...this.props.state.visualization}
              tags={this.props.state.data.report.tags}
              onRankRangeChange={this.onRankChange}
              onSortChange={this.onSortChange}
            />
          )
        }}
        tableConfig={{
          columns,
          data: this.props.state.data.report.tags,
        }}
      />
    );
  }

}


const sortItems = [
  { name: 'sort', value: 'rank', display: 'Rank' },
  { name: 'sort', value: 'alpha', display: 'A-Z' }
];

type Props = {
  tags: Tag[];
  rankRange: RankRange;
  wordCloudSort: Sort;
  onRankRangeChange: (range: RankRange) => void;
  onSortChange: (sort: string) => void;
}

const getRange = memoize((tags: Props['tags']) =>
  tags.reduce(
    ( [ min, max ], { count } ) => [ Math.min(min, count), Math.max(max, count) ],
    [ Infinity, -Infinity ]
  ))

const WordCloud = pure(({ tags, rankRange, wordCloudSort, onRankRangeChange, onSortChange }: Props) => {
  const [ min, max ] = getRange(tags);

  const tagSubset = Seq.from(tags)
    .take(rankRange.max)
    .drop(rankRange.min - 1)
    .orderBy(tag => wordCloudSort === 'alpha' ? tag.word : tag.count, wordCloudSort !== 'alpha');

  const [ subsetMin, subsetMax ] = getRange(tagSubset.toArray());

  return (
    <div className={cx()}>
      <div className={cx('Filter')}>
        <strong>Filter words by rank:</strong>
        <NumberRangeSelector value={rankRange} step={1} start={min} end={max} onChange={onRankRangeChange} />
      </div>
      <div className={cx('Sort')}>
        <strong>Sort by:</strong>
        <RadioList name="sort" items={sortItems} value={wordCloudSort} onChange={onSortChange} />
      </div>
      <div><em>Mouse over a word to see its occurrence in the data</em></div>
      <div className={cx('Cloud')}>
        {tagSubset.map(tag => (
          <div key={tag.word} title={tag.count.toLocaleString()} style={{ fontSize: Math.max(6, 50 * (tag.count / subsetMax)) + 'pt', marginRight: '.5rem' }}>
            {tag.word}
          </div>
        ))}
      </div>
    </div>
  );
});
