import React from 'react';
import { toPercentage } from '../../Components/AttributeFilter/AttributeFilterUtils';
import { OntologyTermSummary } from '../../Components/AttributeFilter/Types';

interface UnknownCountProps {
  activeFieldState: {
    summary: OntologyTermSummary;
  };
  dataCount: number;
  displayName: string;
}

export default function UnknownCount(props: UnknownCountProps) {
  const { activeFieldState, dataCount, displayName } = props;
  return (
    <div className="unknown-count">
      <b>
        {activeFieldState.summary.internalsCount.toLocaleString()} (
        {toPercentage(
          activeFieldState.summary.internalsCount,
          dataCount
        ).toLocaleString()}
        %) of {dataCount.toLocaleString()}
      </b>{' '}
      {displayName} have data for this variable
    </div>
  );
}
