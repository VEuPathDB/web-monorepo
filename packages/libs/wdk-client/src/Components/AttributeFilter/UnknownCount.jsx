import React from 'react';

export default function UnknownCount(props) {
  const { activeFieldState, dataCount, displayName } = props;
  const unknownCount = dataCount - activeFieldState.summary.internalsCount;
  const percent = Math.round(activeFieldState.summary.internalsCount*100/dataCount);
  return unknownCount > 0
    ? (
      <div className="unknown-count">
         {/*  <b>{unknownCount.toLocaleString()} of {dataCount.toLocaleString()}</b> {displayName} have no data provided for this filter */}
        <b>{activeFieldState.summary.internalsCount.toLocaleString()} ({percent}%) of {dataCount.toLocaleString()}</b> {displayName} have data for this filter
      </div>
    )
    : null
}
