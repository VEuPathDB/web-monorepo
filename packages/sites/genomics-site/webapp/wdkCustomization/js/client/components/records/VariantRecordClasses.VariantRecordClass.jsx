import React from 'react';
import { CollapsibleSection } from '@veupathdb/wdk-client/lib/Components';
import { StrainMsaForm } from '../common/StrainMsaForm';

export function RecordAttributeSection(props) {
  return props.attribute.name === 'variant_strain_form' ? (
    <StrainFilterSection {...props} />
  ) : (
    <props.DefaultComponent {...props} />
  );
}

function StrainFilterSection(props) {
  return (
    <CollapsibleSection
      id={props.attribute.name}
      headerContent={props.attribute.displayName}
      isCollapsed={props.isCollapsed}
      onCollapsedChange={props.onCollapsedChange}
    >
      <StrainMsaForm record={props.record} />
    </CollapsibleSection>
  );
}
