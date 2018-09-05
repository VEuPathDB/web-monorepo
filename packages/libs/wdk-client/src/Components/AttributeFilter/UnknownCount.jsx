import React from 'react';

export default function UnknownCount(props) {
  const { activeFieldState, dataCount, displayName } = props;
  const unknownCount = dataCount - activeFieldState.summary.internalsCount;
  return unknownCount > 0
    ? (
      <div className="unknown-count">
        <b>{unknownCount.toLocaleString()} of {dataCount.toLocaleString()}</b> {displayName} have no data provided for this filter
      </div>
    )
    : null
}
