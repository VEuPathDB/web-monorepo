import React from 'react';
import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

/**
 * The default heading is "<recordClass>: <id>", which here reads
 * "Short Variant: Variant_Pf3D7_01_v3_100057" - the id already says what it is.
 * Show the id alone.
 */
export function RecordHeading({ DefaultComponent, ...props }) {
  return (
    <DefaultComponent
      {...props}
      displayName={safeHtml(props.record.displayName)}
    />
  );
}
