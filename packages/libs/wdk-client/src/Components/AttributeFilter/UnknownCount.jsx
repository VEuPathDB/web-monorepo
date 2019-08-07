import React from 'react';

export default function UnknownCount(props) {
  const { activeFieldState, dataCount, displayName } = props;
  const percent = Math.round(activeFieldState.summary.internalsCount*100/dataCount);
  return (
    <div className="unknown-count">
      <b>{activeFieldState.summary.internalsCount.toLocaleString()} ({percent}%) of {dataCount.toLocaleString()}</b> {displayName} have data for this filter
      </div>
  );
}
