import { flowRight } from 'lodash';
import React from 'react';
import RecordMainCategorySection from '../../../Views/Records/RecordMain/RecordMainCategorySection';
import { pure, wrappable } from '../../../Utils/ComponentUtils';
import { getId, getLabel, CategoryTreeNode } from '../../../Utils/CategoryUtils';
import { RecordInstance, RecordClass } from '../../../Utils/WdkModel';
import { TableState } from '../../../StoreModules/RecordStoreModule';
import { PartialRecordRequest } from '../../../Views/Records/RecordUtils';

interface RecordMainSectionProps {
  depth?: number;
  record: RecordInstance;
  recordClass: RecordClass;
  tableStates: Record<string, TableState>;
  updateTableState: (tableName: string, tableState: TableState) => void;
  categories: CategoryTreeNode[] | null;
  collapsedSections: string[];
  parentEnumeration?: string;
  onSectionToggle: (categoryId: string, isVisible: boolean) => void;
  requestPartialRecord: (request: PartialRecordRequest) => void;
}

/** @type {React.FunctionComponent} */
let RecordMainSection$: React.FunctionComponent<RecordMainSectionProps>;

const RecordMainSection: React.FC<RecordMainSectionProps> = ({
  depth = 0,
  record,
  recordClass,
  tableStates,
  updateTableState,
  categories,
  collapsedSections,
  parentEnumeration,
  onSectionToggle,
  requestPartialRecord,
}) =>
  categories == null ? null : (
    <>
      {categories.map((category, index) => {
        let categoryName = getLabel(category);
        let categoryId = getId(category);
        let enumeration = String(
          parentEnumeration == null
            ? index + 1
            : parentEnumeration + '.' + (index + 1)
        );

        return (
          <RecordMainCategorySection
            key={categoryName}
            category={category}
            depth={depth}
            enumeration={enumeration}
            isCollapsed={collapsedSections.includes(categoryId)}
            onSectionToggle={onSectionToggle}
            record={record}
            recordClass={recordClass}
            tableStates={tableStates}
            requestPartialRecord={requestPartialRecord}
            updateTableState={updateTableState}
          >
            <RecordMainSection$
              depth={depth + 1}
              record={record}
              recordClass={recordClass}
              tableStates={tableStates}
              categories={category.children}
              collapsedSections={collapsedSections}
              parentEnumeration={enumeration}
              onSectionToggle={onSectionToggle}
              requestPartialRecord={requestPartialRecord}
              updateTableState={updateTableState}
            />
          </RecordMainCategorySection>
        );
      })}
    </>
  );

// Append `$` so we can refer to this component recursively. We want to reserve
// the normal name `RecordMainSection` for the inner function for debugging purposes.
RecordMainSection$ = flowRight(wrappable, pure)(RecordMainSection);

export default RecordMainSection$;
