import React from 'react';

import NumberRangeSelector from 'wdk-client/Components/InputControls/NumberRangeSelector';
import RadioList from 'wdk-client/Components/InputControls/RadioList';
import { makeClassNameHelper, pure } from 'wdk-client/Utils/ComponentUtils';
import { Seq } from 'wdk-client/Utils/IterableUtils';

import {
  RankRange,
  Sort,
} from 'wdk-client/Actions/WordCloudAnalysisActions';

import 'wdk-client/Views/AttributeAnalysis/WordCloudAnalysis/WordCloudAnalysis.scss';

export interface Tag {
  word: string;
  count: number;
};

const cx = makeClassNameHelper('WordCloudAnalysis');

const sortItems = [
  { name: 'sort', value: 'rank', display: 'Rank' },
  { name: 'sort', value: 'alpha', display: 'A-Z' }
];

type WordCloudProps = {
  tags: Tag[];
  rankRange: RankRange;
  sort: Sort;
  onRankRangeChange: (range: RankRange) => void;
  onSortChange: (sort: string) => void;
}

export const WordCloud = pure(({ tags, rankRange, sort, onRankRangeChange, onSortChange }: WordCloudProps) => {
  const tagSubset = Seq.from(tags)
    .take(rankRange.max)
    .drop(rankRange.min - 1)
    .orderBy(tag => sort === 'alpha' ? tag.word : tag.count, sort !== 'alpha');

  const subsetMax = Math.max(...tagSubset.map(tag => tag.count));

  return (
    <div className={cx()}>
      <div className={cx('Filter')}>
        <strong>Filter words by rank:</strong>
        <NumberRangeSelector value={rankRange} step={1} start={1} end={tags.length} onChange={onRankRangeChange} />
      </div>
      <div className={cx('Sort')}>
        <strong>Sort by:</strong>
        <RadioList name="sort" items={sortItems} value={sort} onChange={onSortChange} />
      </div>
      <div><em>Mouse over a word to see its occurrence in the data</em></div>
      <div className={cx('Cloud')}>
        {tagSubset.map(tag => (
          <div key={tag.word} title={`${tag.count.toLocaleString()} occurrences`} style={{ fontSize: Math.max(6, 50 * (tag.count / subsetMax)) + 'pt', marginRight: '.5rem' }}>
            {tag.word}
          </div>
        ))}
      </div>
    </div>
  );
});
