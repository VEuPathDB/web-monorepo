import React from 'react';

import Attribute from './Attribute';
import Link from '@veupathdb/wdk-client/lib/Components/Link';

import * as VDI from '../../../../Service/Model';
import * as WDK from '@veupathdb/wdk-client/lib/Utils/WdkModel'

import { diyUserDatasetIdToWdkRecordId } from '../../../../Utils/diyDatasets';

export type AvailableSearchesProps = {
  readonly dataset: VDI.DatasetGetResponseBody;
  readonly questions: ReadonlyArray<WDK.Question>;
};

export const AvailableSearches = ({
  dataset,
  questions,
}: AvailableSearchesProps) => (
  <Attribute label="Available searches">
    <ul>
      {questions.map(it => (
        <AvailableSearch key={it.fullName} dataset={dataset} question={it} />
      ))}
    </ul>
  </Attribute>
);

// Individual List Item

type AvailableSearchProps = {
  readonly dataset: VDI.DatasetGetResponseBody;
  readonly question: WDK.Question;
};

const AvailableSearch = ({
  dataset,
  question: {
    displayName,
    outputRecordClassName,
    paramNames,
    urlSegment,
  },
}: AvailableSearchProps): React.ReactElement => {
  let url = `/search/${outputRecordClassName}/${urlSegment}`;

  const ps = paramNames.filter(it => it.match(/ataset/));

  if (ps.length === 1) {
    url += `?param.${ps[0]}=`;

    url += ps[0] === 'eda_dataset_id'
      ? diyUserDatasetIdToWdkRecordId(dataset.datasetId)
      : dataset.datasetId;

    if (dataset.type.name === 'genelist') {
      url += '&autoRun';
    }
  }

  return (
    <li>
      <Link to={url}>{displayName}</Link>
    </li>
  );
}