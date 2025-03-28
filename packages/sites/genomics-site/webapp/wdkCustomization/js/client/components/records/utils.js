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
    const requestFields = useCallback(
      (options) => {
        if (requestId == null || record == null) return;
        dispatch(
          RecordActions.requestPartialRecord(
            requestId,
            recordClass.urlSegment,
            record.id.map((part) => part.value),
            options.attributes,
            options.tables
          )
        );
      },
      [dispatch, requestId]
    );
    return <Component {...props} requestFields={requestFields} />;
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

  return memoize(compose(stripHTML, getDataProperty), getDataProperty);
}

export function scrollToAndOpenExpressionGraph({
  expressionGraphs,
  findIndexFn,
  tableId,
  updateSectionVisibility,
  updateTableState,
  tableState,
}) {
  // Find the associated expression graph row data
  const expressionGraphIndex = expressionGraphs.findIndex(findIndexFn);

  // If the expression graph table is available...
  if (expressionGraphIndex !== -1) {
    // Ensure the table section is visible
    updateSectionVisibility(tableId, true);
    // Add a history entry so users can use the back button to go back to this section
    window.history.pushState(null, null, `#${tableId}`);

    const expressionGraphTableElement = document.getElementById(tableId);
    const expressionGraphTableRowElement =
      expressionGraphTableElement?.querySelector(
        `tr#row_id_${expressionGraphIndex}`
      );

    if (expressionGraphTableRowElement != null) {
      // Update table state (select and expand the row)
      updateTableState(tableId, {
        ...tableState,
        selectedRow: expressionGraphIndex,
        expandedRows: (tableState?.expandedRows ?? []).concat([
          expressionGraphIndex,
        ]),
      });

      expressionGraphTableRowElement.scrollIntoView();
    }
  }
}
