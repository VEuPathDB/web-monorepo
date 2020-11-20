import React from 'react';
import {CollapsibleSection} from '@veupathdb/wdk-client/lib/Components';
import {SnpsAlignmentForm} from '../common/Snps';

export function RecordAttributeSection(props) {
  return props.attribute.name === 'snps_alignment_form' ? SnpsAlignment(props)
       : <props.DefaultComponent {...props}/>
}

function SnpsAlignment(props) {
  let {
    align_context_start,
    align_context_end,
    seq_source_id,
    organism_text
  } = props.record.attributes;
  return (
    <CollapsibleSection
      id={props.attribute.name}
      headerContent={props.attribute.displayName}
      isCollapsed={props.isCollapsed}
      onCollapsedChange={props.onCollapsedChange}
    >
      <SnpsAlignmentForm
        start={align_context_start}
        end={align_context_end}
        sequenceId={seq_source_id}
        organism={organism_text}
      />
    </CollapsibleSection>
  );
}
