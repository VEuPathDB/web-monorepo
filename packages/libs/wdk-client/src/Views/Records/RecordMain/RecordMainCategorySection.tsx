import React from 'react';
import RecordAttributeSection from '../../../Views/Records/RecordAttributes/RecordAttributeSection';
import RecordTableSection from '../../../Views/Records/RecordTable/RecordTableSection';
import CollapsibleSection from '../../../Components/Display/CollapsibleSection';
import { wrappable } from '../../../Utils/ComponentUtils';
import {
  getId,
  getTargetType,
  getDisplayName,
  CategoryTreeNode,
  IndividualNode,
} from '../../../Utils/CategoryUtils';
import {
  RecordInstance,
  RecordClass,
  AttributeField,
  TableField,
} from '../../../Utils/WdkModel';
import { TableState } from '../../../StoreModules/RecordStoreModule';

export interface Props {
  category: CategoryTreeNode;
  depth: number;
  enumeration: string;
  isCollapsed: boolean;
  onSectionToggle: (categoryId: string, isVisible: boolean) => void;
  record: RecordInstance;
  recordClass: RecordClass;
  tableStates: Record<string, TableState>;
  updateTableState: (tableName: string, tableState: TableState) => void;
  requestPartialRecord: (request: any) => void;
  children?: React.ReactElement;
}

/**
 * Content for a node of a record category tree, or a record field.
 */
class RecordMainCategorySection extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
    this.toggleCollapse = this.toggleCollapse.bind(this);
  }

  toggleCollapse() {
    let { category, onSectionToggle, isCollapsed, depth } = this.props;
    // only toggle non-top-level category and wdkReference nodes
    if ('wdkReference' in category || depth > 0) {
      onSectionToggle(
        getId(category),
        // It's tempting to negate this value, but we are sending the value
        // we want for isVisible here.
        isCollapsed
      );
    }
  }

  render() {
    let {
      record,
      recordClass,
      tableStates,
      updateTableState,
      category,
      depth,
      isCollapsed,
      enumeration,
      children,
      requestPartialRecord,
    } = this.props;

    switch (getTargetType(category)) {
      case 'attribute':
        return (
          <RecordAttributeSection
            attribute={
              (category as IndividualNode).wdkReference as AttributeField
            }
            ontologyProperties={category.properties}
            record={record}
            recordClass={recordClass}
            isCollapsed={isCollapsed}
            onCollapsedChange={this.toggleCollapse}
            requestPartialRecord={requestPartialRecord}
          />
        );

      case 'table': {
        const individualCategory = category as IndividualNode;
        return (
          <RecordTableSection
            table={individualCategory.wdkReference as TableField}
            tableState={tableStates[individualCategory.wdkReference.name]}
            updateTableState={(tableState) =>
              updateTableState(individualCategory.wdkReference.name, tableState)
            }
            ontologyProperties={category.properties}
            record={record}
            recordClass={recordClass}
            isCollapsed={isCollapsed}
            onCollapsedChange={this.toggleCollapse}
            requestPartialRecord={requestPartialRecord}
          />
        );
      }

      default: {
        let id = getId(category);
        let categoryName = getDisplayName(category);
        let Header = ('h' + Math.min(depth + 2, 6)) as keyof React.ReactHTML;
        let headerContent = (
          <span>
            {categoryName}
            <a
              className="wdk-RecordSectionLink"
              onClick={(e) => e.stopPropagation()}
              href={'#' + id}
            >
              &sect;
            </a>
          </span>
        );
        if (depth === 0) {
          const HeaderElement = Header as keyof JSX.IntrinsicElements;
          return (
            <>
              <HeaderElement id={id} className="wdk-RecordSectionHeader">
                {headerContent}
              </HeaderElement>
              <div className="wdk-RecordSectionChildren">{children}</div>
            </>
          );
        }
        return (
          <CollapsibleSection
            id={id}
            className={'wdk-RecordSubsection'}
            headerComponent={Header}
            headerContent={headerContent}
            isCollapsed={isCollapsed}
            onCollapsedChange={this.toggleCollapse}
          >
            {children}
          </CollapsibleSection>
        );
      }
    }
  }
}

export default wrappable(RecordMainCategorySection);
