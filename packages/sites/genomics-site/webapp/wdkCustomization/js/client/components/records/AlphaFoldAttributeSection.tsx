import React, { useEffect, useRef, useState } from 'react';
import {
  BlockRecordAttributeSection,
  Props,
} from '@veupathdb/wdk-client/lib/Views/Records/RecordAttributes/RecordAttributeSection';

/*
 * This component does two things:
 *
 * 1. It imports the required assets needed to render
 * the web component.
 * 2. It renders the attribute section as a block section.
 */

export function AlphaFoldRecordSection(props: Props) {
  const areAssetsLoadingRef = useRef(false);
  useEffect(() => {
    if (!props.isCollapsed && !areAssetsLoadingRef.current) {
      // Using dynamic import to lazy load these scripts
      // @ts-ignore
      import('../../../../../../vendored/pdbe-molstar-light-3.0.0.css');
      // @ts-ignore
      import('../../../../../../vendored/pdbe-molstar-component-3.0.0.js');
      areAssetsLoadingRef.current = true;
    }
  }, [props.isCollapsed]);
  return (
    <>
      <BlockRecordAttributeSection {...props} />
    </>
  );
}
