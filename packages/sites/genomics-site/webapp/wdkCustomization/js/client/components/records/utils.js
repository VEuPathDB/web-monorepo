import React, { useCallback } from 'react';
import { connect } from 'react-redux';

import { compose, defaultTo, memoize, property } from 'lodash/fp';

import { RecordActions } from '@veupathdb/wdk-client/lib/Actions';
import { stripHTML } from '@veupathdb/wdk-client/lib/Utils/DomUtils';

/**
 * Higher order component to ensure that record fields
 * are requested and present before rendering.
 */
export function withRequestFields(Component) {
  return connect(mapRecordStateToProps)(WithFieldsWrapper);
  function WithFieldsWrapper({ dispatch, currentRecordState, ...props }) {
    const { requestId, record, recordClass } = currentRecordState;
    const requestFields = useCallback((options) => {
      if (requestId == null || record == null) return;
      dispatch(RecordActions.requestPartialRecord(
        requestId,
        recordClass.urlSegment,
        record.id.map(part => part.value),
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

function getCytoscapeElementData(cyElement) {
  return cyElement.data();
}

export function renderNodeLabelMarkup(dataProp) {
  const getDataProperty = compose(
    defaultTo(''),
    property(dataProp),
    getCytoscapeElementData
  );

  return memoize(
    compose(stripHTML, getDataProperty),
    getDataProperty
  );
}
