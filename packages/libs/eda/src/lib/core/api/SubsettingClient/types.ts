/* eslint-disable @typescript-eslint/no-redeclare */

import {
  array,
  number,
  partial,
  intersection,
  union,
  string,
  type,
  TypeOf,
} from 'io-ts';

import { StudyMetadata } from '../../types/study';
import { Filter } from '../../types/filter';

export type StudyResponse = TypeOf<typeof StudyResponse>;

export const StudyResponse = type({
  study: StudyMetadata,
});

export interface DistributionRequestParams {
  filters: Filter[];
  binSpec?: {
    displayRangeMin: number | string;
    displayRangeMax: number | string;
    binWidth: number;
    binUnits?: string;
  };
  valueSpec: 'count';
  /* | 'proportion' FIXME only count works right now */
}

export type DistributionResponse = TypeOf<typeof DistributionResponse>;

export const DistributionResponse = type({
  histogram: array(
    type({
      value: number,
      binStart: string,
      binEnd: string,
      binLabel: string,
    })
  ),
  statistics: intersection([
    partial({
      subsetMin: union([number, string]),
      subsetMax: union([number, string]),
      subsetMean: union([number, string]),
    }),
    type({
      numVarValues: number,
      numDistinctValues: number,
      numDistinctEntityRecords: number,
      numMissingCases: number,
    }),
  ]),
});

////////////////
// Table Data //
////////////////
export interface TabularDataRequestParams {
  filters: Array<Filter>;
  outputVariableIds: Array<string>;
  reportConfig?: {
    headerFormat?: 'standard' | 'display';
    trimTimeFromDateVars?: boolean;
    paging?: {
      numRows: number;
      offset: number;
    };
    sorting?: Array<{
      key: string;
      direction: 'asc' | 'desc';
    }>;
  };
}

export type TabularDataResponse = TypeOf<typeof TabularDataResponse>;
export const TabularDataResponse = array(array(string));
