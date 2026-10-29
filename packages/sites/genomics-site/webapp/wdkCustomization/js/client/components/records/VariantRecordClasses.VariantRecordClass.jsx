import React from 'react';
import { CollapsibleSection } from '@veupathdb/wdk-client/lib/Components';
import { StrainMsaForm } from '../common/StrainMsaForm';

// Tables that should be collapsed by default when a variant record page loads.
export const defaultCollapsedTableNames = ['VariantStrains'];

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
