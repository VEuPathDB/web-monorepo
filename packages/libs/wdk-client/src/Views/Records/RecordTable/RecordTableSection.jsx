import PropTypes from 'prop-types';
import { includes } from 'lodash';
import React from 'react';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';
import RecordTable from 'wdk-client/Views/Records/RecordTable/RecordTable';
import RecordTableDescription from 'wdk-client/Views/Records/RecordTable/RecordTableDescription';
import CollapsibleSection from 'wdk-client/Components/Display/CollapsibleSection';
import ErrorBoundary from 'wdk-client/Core/Controllers/ErrorBoundary';

/** Record table section on record page */
function RecordTableSection(props) {
  let { table, record, recordClass, isCollapsed, onCollapsedChange } = props;
  let { name, displayName } = table;
  let value = record.tables[name];
  let isError = includes(record.tableErrors, name);
  let isLoading = value == null;
  let className = [ 'wdk-RecordTable', 'wdk-RecordTable__' + table.name ].join(' ');

  return (
    <CollapsibleSection
      id={name}
      className="wdk-RecordTableContainer"
      headerContent={displayName}
      isCollapsed={isCollapsed}
      onCollapsedChange={onCollapsedChange}
    >
      <ErrorBoundary>
        <RecordTableDescription table={table} record={record} recordClass={recordClass}/>
        { isError ? <p style={{ color: 'darkred', fontStyle: 'italic' }}>Unable to load data due to a server error.</p>
        : isLoading ? <p>Loading...</p>
        : <RecordTable className={className} value={value} table={table} record={record} recordClass={recordClass}/> }
      </ErrorBoundary>
    </CollapsibleSection>
  );
}

RecordTableSection.propTypes = {
  table: PropTypes.object.isRequired,
  ontologyProperties: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)).isRequired,
  record: PropTypes.object.isRequired,
  recordClass: PropTypes.object.isRequired,
  isCollapsed: PropTypes.bool.isRequired,
  onCollapsedChange: PropTypes.func.isRequired
};

export default wrappable(RecordTableSection);
