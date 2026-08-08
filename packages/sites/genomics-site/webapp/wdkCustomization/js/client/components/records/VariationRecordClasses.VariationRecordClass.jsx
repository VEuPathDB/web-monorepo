import React from 'react';
import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

/**
 * The record class is "Variation" but every source_id reads "Variant_...", so the
 * default "<recordClass>: <id>" heading pairs two different words. Show the id alone.
 */
export function RecordHeading({ DefaultComponent, ...props }) {
  return (
    <DefaultComponent
      {...props}
      displayName={safeHtml(props.record.displayName)}
    />
  );
}
