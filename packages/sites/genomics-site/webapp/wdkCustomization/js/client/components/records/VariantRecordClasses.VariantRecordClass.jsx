import React from 'react';
import { CollapsibleSection } from '@veupathdb/wdk-client/lib/Components';
import { VariantStrainFilter } from '../common/VariantStrainFilter';

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
      <VariantStrainFilter />
    </CollapsibleSection>
  );
}
