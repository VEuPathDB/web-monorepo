import { includes } from 'lodash';
import React from 'react';
import { useEffect, useRef } from 'react';
import CollapsibleSection from '../../../Components/Display/CollapsibleSection';
import ErrorBoundary from '../../../Core/Controllers/ErrorBoundary';
import { CategoryTreeNode } from '../../../Utils/CategoryUtils';
import { wrappable } from '../../../Utils/ComponentUtils';
import {
  TableField,
  RecordInstance,
  RecordClass,
} from '../../../Utils/WdkModel';
import RecordTable from '../../../Views/Records/RecordTable/RecordTable';
import RecordTableDescription from '../../../Views/Records/RecordTable/RecordTableDescription';
import { PartialRecordRequest } from '../../../Views/Records/RecordUtils';
import { DefaultSectionTitle } from '../../../Views/Records/SectionTitle';
import {
  DEFAULT_TABLE_STATE,
  TableState,
} from '../../../StoreModules/RecordStoreModule';

export interface Props {
  table: TableField;
  tableState: TableState;
  updateTableState: (tableState: TableState) => void;
  isCollapsed: boolean;
  onCollapsedChange: () => void;
  ontologyProperties: CategoryTreeNode['properties'];
  record: RecordInstance;
  recordClass: RecordClass;
  requestPartialRecord: (request: PartialRecordRequest) => void;
  title?: React.ReactNode;
}

/** Record table section on record page */
function RecordTableSection(props: Props) {
  let {
    table,
    tableState = DEFAULT_TABLE_STATE,
    updateTableState,
    record,
    recordClass,
    isCollapsed,
    onCollapsedChange,
    requestPartialRecord,
    title,
    ontologyProperties,
  } = props;
  let { displayName, help, name } = table;
  let value = record.tables[name];
  let isError = includes(record.tableErrors, name);
  let isLoading = value == null;
  let className = ['wdk-RecordTable', 'wdk-RecordTable__' + table.name].join(
    ' '
  );

  const requestedRef = useRef(false);

  useEffect(() => {
    if (isCollapsed || requestedRef.current) return;
    requestPartialRecord({ tables: [name] });
    requestedRef.current = true;
  }, [isCollapsed]);

  const headerContent = title ?? (
    <DefaultSectionTitle displayName={displayName} help={help} />
  );

  return (
    <CollapsibleSection
      id={name}
      className="wdk-RecordTableContainer"
      headerContent={headerContent}
      isCollapsed={isCollapsed}
      onCollapsedChange={onCollapsedChange}
    >
      <ErrorBoundary>
        <RecordTableDescription
          ontologyProperties={ontologyProperties}
          table={table}
          record={record}
          recordClass={recordClass}
        />
        {isError ? (
          <p style={{ color: 'darkred', fontStyle: 'italic' }}>
            Unable to load data due to a server error.
          </p>
        ) : isLoading ? (
          <p>Loading...</p>
        ) : (
          <RecordTable
            className={className}
            value={value}
            table={table}
            // @ts-ignore
            record={record}
            recordClass={recordClass}
            expandedRows={tableState.expandedRows}
            searchTerm={tableState.searchTerm}
            ontologyProperties={ontologyProperties}
            onExpandedRowsChange={(expandedRows) =>
              updateTableState({ ...tableState, expandedRows })
            }
            onSearchTermChange={(searchTerm) =>
              updateTableState({ ...tableState, searchTerm })
            }
          />
        )}
      </ErrorBoundary>
    </CollapsibleSection>
  );
}

export default wrappable(RecordTableSection);
