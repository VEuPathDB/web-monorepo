import React from 'react';

import { capitalize } from 'lodash';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

const toTitleCase = (str: string) => str.split(' ').map(capitalize).join(' ');

export type FoldChangeOperation =
  | 'none'
  | 'minimum'
  | 'maximum'
  | 'median'
  | 'mean'
  | 'average';

export interface UntypedSampleCollectionConfig {
  sampleCount: number;
  operation: FoldChangeOperation;
}

export interface SampleCollectionConfig extends UntypedSampleCollectionConfig {
  valueType: string;
}

interface SampleCollectionProps extends SampleCollectionConfig {
  shouldPlaceHigh: boolean;
}

const cx = makeClassNameHelper('wdk-SampleCollection');

const SMALL_STEPS = [0, 100, 33, 66];
const BIG_STEPS = [0, 200, 66, 133];

const percentageToStepStyle = (percentage: number): React.CSSProperties => ({
  top: `${percentage}%`,
});

const calculateStepStyles = (
  stepCount: number,
  operation: FoldChangeOperation,
  shouldPlaceHigh: boolean
): React.CSSProperties[] => {
  if (operation === 'minimum') {
    return shouldPlaceHigh
      ? SMALL_STEPS.map((x) => -x)
          .slice(0, stepCount)
          .map(percentageToStepStyle)
      : BIG_STEPS.map((x) => -x)
          .slice(0, stepCount)
          .map(percentageToStepStyle);
  } else if (operation === 'maximum') {
    return shouldPlaceHigh
      ? BIG_STEPS.slice(0, stepCount).map(percentageToStepStyle)
      : SMALL_STEPS.slice(0, stepCount).map(percentageToStepStyle);
  } else if (
    (operation === 'median' ||
      operation === 'mean' ||
      operation === 'average') &&
    stepCount >= 2
  ) {
    if (stepCount === 2) {
      return [-90, 90].map(percentageToStepStyle);
    } else if (stepCount === 3) {
      return [-90, 90, 0].map(percentageToStepStyle);
    } else {
      return [-90, 90, -50, 50].map(percentageToStepStyle);
    }
  } else {
    return SMALL_STEPS.slice(0, stepCount).map(percentageToStepStyle);
  }
};

const operationLabel = (
  operation: string,
  valueType: string,
  sampleType: string
) =>
  operation === 'none'
    ? toTitleCase([valueType, sampleType].join(' '))
    : toTitleCase([operation, valueType, sampleType].join(' '));

const samplesLabel = (sampleType: string) => [
  toTitleCase(sampleType),
  <br />,
  'Samples',
];

const sampleCollection =
  (
    sampleType: string,
    collectionClassName: string
  ): React.FunctionComponent<SampleCollectionProps> =>
  ({ sampleCount, operation, shouldPlaceHigh, valueType }) => {
    const dampedSampleCount = Math.min(sampleCount, 4);
    const stepCount = dampedSampleCount;
    const stepStyles = calculateStepStyles(
      stepCount,
      operation,
      shouldPlaceHigh
    );

    return (
      <div className={`${cx()} ${cx(collectionClassName)}`}>
        {sampleCount > 0 && (
          <>
            <div className={cx('Operation')}>
              <div className={cx('OperationLine')}></div>
              {operationLabel(operation, valueType, sampleType)}
              {stepStyles.map((style, i) => (
                <div className={cx('Sample')} key={i} style={style}></div>
              ))}
            </div>
            <div className={cx('SamplesLabel')}>{samplesLabel(sampleType)}</div>
          </>
        )}
      </div>
    );
  };

export const ReferenceSampleCollection = sampleCollection(
  'Reference',
  'ReferenceSamples'
);
export const ComparisonSampleCollection = sampleCollection(
  'Comparison',
  'ComparisonSamples'
);
