import React, { ReactElement } from 'react';

import Attribute from './Attribute';
import Link from '@veupathdb/wdk-client/lib/Components/Link';

import { diyUserDatasetIdToWdkRecordId } from '../../../../Utils/diyDatasets';
import { isEmpty } from 'lodash';
import { DatasetGetResponseBody } from '../../../../Service';
import { Question } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { Possible } from '../../../../Utils';

export type AvailableSearchesProps = {
  readonly dataset: DatasetGetResponseBody;
  readonly questions: Possible<ReadonlyArray<Question>>;
};

export const AvailableSearches = ({
  dataset,
  questions,
}: AvailableSearchesProps): ReactElement =>
  isEmpty(questions)
    ? <></>
    : (
      <Attribute label="Available searches">
        <ul>
          {questions!.map(it => (
            <AvailableSearch key={it.fullName} dataset={dataset} question={it} />
          ))}
        </ul>
      </Attribute>
    );

// Individual List Item

type AvailableSearchProps = {
  readonly dataset: DatasetGetResponseBody;
  readonly question: Question;
};

const AvailableSearch = ({
  dataset,
  question: {
    displayName,
    outputRecordClassName,
    paramNames,
    urlSegment,
  },
}: AvailableSearchProps): ReactElement => {
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