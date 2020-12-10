import React from 'react';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';
import CollapsibleSection from 'wdk-client/Components/Display/CollapsibleSection';
import ErrorBoundary from 'wdk-client/Core/Controllers/ErrorBoundary';
import { CategoryTreeNode } from 'wdk-client/Utils/CategoryUtils';
import { AttributeField, RecordClass, RecordInstance } from 'wdk-client/Utils/WdkModel';
import RecordAttribute from 'wdk-client/Views/Records/RecordAttributes/RecordAttribute';
import { PartialRecordRequest } from 'wdk-client/Views/Records/RecordUtils';
import { DefaultSectionHeading } from 'wdk-client/Views/Records/SectionHeading';

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
  let value = props.record.attributes[props.attribute.name];
  if (value == null) return null;
  if (typeof value === 'string' && value.length < 150) return (
    <InlineRecordAttributeSection {...props} />
  )
  else return (
    <BlockRecordAttributeSection {...props} />
  )
}

export default wrappable(RecordAttributeSection);

/** Display attribute name and value on a single line */
function InlineRecordAttributeSection(props: Props) {
  let { attribute, record, recordClass, title } = props;
  let { displayName, help, name } = attribute;
  return (
    <div id={name}
      className={`wdk-RecordAttributeSectionItem wdk-RecordAttributeSectionItem__${name}`}>
      <div className="wdk-RecordAttributeName">
        {
          title ??
          <DefaultSectionHeading
            displayName={displayName}
            help={help}
          />
        }
      </div>
      {' '}
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
function BlockRecordAttributeSection(props: Props) {
  const { attribute, record, recordClass, isCollapsed, onCollapsedChange } = props;
  const { displayName, help, name } = attribute;

  const headerContent = <DefaultSectionHeading displayName={displayName} help={help} />;

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
  )
}
