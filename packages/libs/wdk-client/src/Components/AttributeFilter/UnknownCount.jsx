import React from 'react';
import { toPercentage } from '../../Components/AttributeFilter/AttributeFilterUtils';

export default function UnknownCount(props) {
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
