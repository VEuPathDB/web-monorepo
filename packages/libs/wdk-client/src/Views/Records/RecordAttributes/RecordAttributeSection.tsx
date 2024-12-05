import React, { useMemo } from 'react';
import { wrappable } from '../../../Utils/ComponentUtils';
import CollapsibleSection from '../../../Components/Display/CollapsibleSection';
import ErrorBoundary from '../../../Core/Controllers/ErrorBoundary';
import { CategoryTreeNode } from '../../../Utils/CategoryUtils';
import {
  AttributeField,
  RecordClass,
  RecordInstance,
} from '../../../Utils/WdkModel';
import RecordAttribute from '../../../Views/Records/RecordAttributes/RecordAttribute';
import { PartialRecordRequest } from '../../../Views/Records/RecordUtils';
import { DefaultSectionTitle } from '../../../Views/Records/SectionTitle';
import { stripHTML } from '../../../Utils/DomUtils';

export interface Props {
  attribute: AttributeField;
  isCollapsed: boolean;
  onCollapsedChange: () => void;
  ontologyProperties: CategoryTreeNode['properties'];
  record: RecordInstance;
  recordClass: RecordClass;
  requestPartialRecord: (request: PartialRecordRequest) => void;
  title?: React.ReactNode;
}

/** Record attribute section container for record page */
function RecordAttributeSection(props: Props) {
  return <BlockRecordAttributeSection {...props} />;
}

export default wrappable(RecordAttributeSection);

/** Display attribute name and value on a single line */
export function InlineRecordAttributeSection(props: Props) {
  let { attribute, record, recordClass, title } = props;
  let { displayName, help, name } = attribute;
  return (
    <div
      id={name}
      className={`wdk-RecordAttributeSectionItem wdk-RecordAttributeSectionItem__${name}`}
    >
      <div className="wdk-RecordAttributeName">
        {title ?? <DefaultSectionTitle displayName={displayName} help={help} />}
      </div>{' '}
      <div className="wdk-RecordAttributeValue">
        <ErrorBoundary>
          <RecordAttribute
            attribute={attribute}
            record={record}
            recordClass={recordClass}
          />
        </ErrorBoundary>
      </div>
    </div>
  );
}

/** Display attribute name and value in a collapsible section */
export function BlockRecordAttributeSection(props: Props) {
  const {
    attribute,
    record,
    recordClass,
    isCollapsed,
    onCollapsedChange,
    title,
  } = props;
  const { displayName, help, name } = attribute;

  const headerContent = title ?? (
    <DefaultSectionTitle displayName={displayName} help={help} />
  );

  return (
    <CollapsibleSection
      id={name}
      className={`wdk-RecordAttributeSectionItem`}
      headerContent={headerContent}
      isCollapsed={isCollapsed}
      onCollapsedChange={onCollapsedChange}
    >
      <ErrorBoundary>
        <RecordAttribute
          attribute={attribute}
          record={record}
          recordClass={recordClass}
        />
      </ErrorBoundary>
    </CollapsibleSection>
  );
}
