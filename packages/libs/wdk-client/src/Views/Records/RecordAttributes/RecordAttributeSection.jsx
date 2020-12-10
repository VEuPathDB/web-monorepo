import PropTypes from 'prop-types';
import React from 'react';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';
import CollapsibleSection from 'wdk-client/Components/Display/CollapsibleSection';
import RecordAttribute from 'wdk-client/Views/Records/RecordAttributes/RecordAttribute';
import { DefaultSectionHeading } from 'wdk-client/Views/Records/SectionHeading';
import ErrorBoundary from 'wdk-client/Core/Controllers/ErrorBoundary';

/** Record attribute section container for record page */
function RecordAttributeSection(props) {
  let value = props.record.attributes[props.attribute.name];
  if (value == null) return null;
  if (value.length < 150) return (
    <InlineRecordAttributeSection {...props} />
  )
  else return (
    <BlockRecordAttributeSection {...props} />
  )
}

RecordAttributeSection.propTypes = {
  attribute: PropTypes.object.isRequired,
  record: PropTypes.object.isRequired,
  recordClass: PropTypes.object.isRequired,
  isCollapsed: PropTypes.bool.isRequired,
  onCollapsedChange: PropTypes.func.isRequired
};

export default wrappable(RecordAttributeSection);

/** Display attribute name and value on a single line */
function InlineRecordAttributeSection(props) {
  let { attribute, record, recordClass } = props;
  let { displayName, help, name } = attribute;
  return (
    <div id={name}
      className={`wdk-RecordAttributeSectionItem wdk-RecordAttributeSectionItem__${name}`}>
      <div className="wdk-RecordAttributeName">
        <DefaultSectionHeading
          displayName={displayName}
          help={help}
        />
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
function BlockRecordAttributeSection(props) {
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
