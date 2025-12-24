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
 * 3. Handles errors from the pdbe-molstar web component.
 */

export function AlphaFoldRecordSection(props: Props) {
  const areAssetsLoadingRef = useRef(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!props.isCollapsed && !areAssetsLoadingRef.current) {
      areAssetsLoadingRef.current = true;

      // Using dynamic import to lazy load these scripts
      Promise.all([
        // @ts-ignore
        import('../../../../../../vendored/pdbe-molstar-light-3.0.0.css'),
        // @ts-ignore
        import('../../../../../../vendored/pdbe-molstar-component-3.0.0.js'),
      ]).catch((error) => {
        console.error('Failed to load pdbe-molstar assets:', error);
        setLoadError('Failed to load structure viewer components.');
      });
    }
  }, [props.isCollapsed]);

  // Add error listener for pdbe-molstar web component errors
  useEffect(() => {
    if (!sectionRef.current) return;

    const handleMolstarError = (event: Event) => {
      // Prevent the unhandled promise rejection from appearing in console
      event.preventDefault();

      const customEvent = event as CustomEvent;
      const errorMessage = customEvent.detail?.message || 'Invalid data cell';

      console.error('PDBe Molstar error:', errorMessage);
      setLoadError(
        'Unable to load the protein structure. The structure file may be unavailable or malformed.'
      );
    };

    const element = sectionRef.current;

    // Listen for errors from pdbe-molstar web component
    element.addEventListener('error', handleMolstarError);

    // Also catch any unhandled promise rejections within this section
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason?.message?.includes('Invalid data cell')) {
        event.preventDefault();
        console.error('PDBe Molstar structure loading error:', event.reason);
        setLoadError(
          'Unable to load the protein structure. The structure file may be unavailable or malformed.'
        );
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      element.removeEventListener('error', handleMolstarError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <div ref={sectionRef}>
      {loadError && (
        <div
          style={{
            padding: '1em',
            margin: '0.5em 0',
            backgroundColor: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '4px',
            color: '#856404',
          }}
        >
          <strong>⚠️ Structure Viewer Error:</strong> {loadError}
        </div>
      )}
      <BlockRecordAttributeSection {...props} />
    </div>
  );
}
