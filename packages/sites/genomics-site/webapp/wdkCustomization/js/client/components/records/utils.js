import React, { useCallback } from 'react';
import { connect } from 'react-redux';

import { RecordActions } from 'wdk-client/Actions';

/**
 * Higher order component to ensure that record fields
 * are requested and present before rendering.
 */
export function withRequestFields(Component) {
  return connect(mapRecordStateToProps)(WithFieldsWrapper);
  function WithFieldsWrapper({ dispatch, currentRecordState, ...props }) {
    const { requestId, record } = currentRecordState;
    const requestFields = useCallback((options) => {
      if (requestId == null || record == null) return;
      dispatch(RecordActions.requestPartialRecord(
        requestId,
        record.recordClassName,
        record.id,
        options.attributes,
        options.tables
      ))
    }, [ dispatch, requestId ]);
    return <Component {...props} requestFields={requestFields}/>
  }
}

function mapRecordStateToProps(state) {
  const currentRecordState = state.record;
  return { currentRecordState };
}