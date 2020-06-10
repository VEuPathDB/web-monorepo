import React from 'react';

import { requestPartialRecord } from 'wdk-client/Actions/RecordActions';
import { CollapsibleSection } from 'wdk-client/Components';
import { CategoryTreeNode } from 'wdk-client/Utils/CategoryUtils';
import { RecordClass, RecordInstance, Reporter } from 'wdk-client/Utils/WdkModel';

import './GroupRecordClasses.GroupRecordClass.scss';

export interface RecordAttributeSectionProps {
  attribute: Reporter;
  isCollapsed: boolean;
  onCollapsedChange: () => void;
  ontologyProperties: CategoryTreeNode['properties'];
  record: RecordInstance;
  recordClass: RecordClass;
  requestPartialRecord: typeof requestPartialRecord;
}

export function RecordAttributeSection(props: RecordAttributeSectionProps & { DefaultComponent: React.ComponentType<RecordAttributeSectionProps> }) {
  return props.attribute.name === 'msa'
    ? <MsaAttributeSection {...props} />
    : <props.DefaultComponent {...props} />;
}

function MsaAttributeSection(props: RecordAttributeSectionProps) {
  const { isCollapsed, onCollapsedChange } = props;
  const { name: attributeName, displayName: attributeDisplayName } = props.attribute;

  const msaValue = props.record.attributes[attributeName];

  return (
    <CollapsibleSection
      id={attributeName}
      className="wdk-RecordAttributeSectionItem"
      headerContent={attributeDisplayName}
      isCollapsed={isCollapsed}
      onCollapsedChange={onCollapsedChange}
    >
      {
        typeof msaValue !== 'string'
          ? <div className="wdk-MissingMsaAttribute">
              We're sorry, multiple sequence alignments are only available for groups with 100 or fewer sequences.
            </div>
          : <pre>
              {msaValue}
            </pre>
      }
    </CollapsibleSection>
  );
}
