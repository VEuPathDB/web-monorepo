import React, { useEffect, useRef, useState } from 'react';

import {
  BlockRecordAttributeSection,
  Props,
} from '@veupathdb/wdk-client/lib/Views/Records/RecordAttributes/RecordAttributeSection';

import { DefaultSectionTitle } from '@veupathdb/wdk-client/lib/Views/Records/SectionTitle';

import { CollapsibleSection } from '@veupathdb/wdk-client/lib/Components/Display/CollapsibleSection';

function AlphaFoldErrorWrapper({
  children,
  attribute: { name, displayName, help },
  isCollapsed,
  onCollapsedChange,
  title,
}: Props & { children: React.ReactNode }) {
  const headerContent = title ?? (
    <DefaultSectionTitle displayName={displayName} help={help} />
  );

  return (
    <CollapsibleSection
      id={name}
      className="wdk-RecordAttributeSection"
      headerContent={headerContent}
      isCollapsed={isCollapsed}
      onCollapsedChange={onCollapsedChange}
    >
      <div className="wdk-RecordAttributeSectionContent">{children}</div>
    </CollapsibleSection>
  );
}

/*
 * This component:
 * 1. Pre-validates the AlphaFold data URL before rendering the web component
 * 2. Imports the required assets for the pdbe-molstar viewer
 * 3. Shows a friendly error if the AlphaFold structure file is not found
 */

export function AlphaFoldRecordSection(props: Props) {
  const areAssetsLoadingRef = useRef(false);
  const [dataUrlStatus, setDataUrlStatus] =
    useState<'loading' | 'valid' | 'invalid' | null>(null);

  // Get the attribute value (HTML containing the pdbe-molstar element)
  const attributeName = props.attribute.name;
  const attributeValue = props.record.attributes[attributeName];

  // Extract the custom-data-url from the HTML
  const extractDataUrl = (htmlString: string): string | null => {
    if (typeof htmlString !== 'string') return null;
    const match = htmlString.match(/custom-data-url=["']([^"']+)["']/);
    return match ? match[1] : null;
  };

  const dataUrl = extractDataUrl(attributeValue + '');
  const hasDataUrl = dataUrl !== null && dataUrl !== '';

  // Pre-validate the data URL
  useEffect(() => {
    if (!props.isCollapsed && hasDataUrl && dataUrlStatus === null) {
      setDataUrlStatus('loading');

      // Make a HEAD request to check if the file exists
      if (dataUrl !== null) {
        fetch(dataUrl, { method: 'HEAD' })
          .then((response) => {
            if (response.ok) {
              setDataUrlStatus('valid');
            } else {
              console.warn(
                `AlphaFold structure file not found: ${dataUrl} (${response.status})`
              );
              setDataUrlStatus('invalid');
            }
          })
          .catch((error) => {
            console.warn(
              `Failed to validate AlphaFold structure file: ${dataUrl}`,
              error
            );
            setDataUrlStatus('invalid');
          });
      } else {
        console.error('URL is null, cannot fetch data.');
      }
    }
  }, [props.isCollapsed, hasDataUrl, dataUrl, dataUrlStatus]);

  // Load viewer assets only if data URL is valid
  useEffect(() => {
    if (
      !props.isCollapsed &&
      !areAssetsLoadingRef.current &&
      dataUrlStatus === 'valid'
    ) {
      // Using dynamic import to lazy load these scripts
      // @ts-ignore
      import('../../../../../../vendored/pdbe-molstar-light-3.0.0.css');
      // @ts-ignore
      import('../../../../../../vendored/pdbe-molstar-component-3.0.0.js');
      areAssetsLoadingRef.current = true;
    }
  }, [props.isCollapsed, dataUrlStatus]);

  // Handle missing data URL
  if (!hasDataUrl) {
    return (
      <div
        className="wdk-RecordAttributeSectionItem"
        style={{ padding: '1em' }}
      >
        <p>
          <em>AlphaFold structure prediction not available for this gene.</em>
        </p>
      </div>
    );
  }

  // Handle data URL validation in progress
  if (dataUrlStatus === 'loading') {
    return (
      <div
        className="wdk-RecordAttributeSectionItem"
        style={{ padding: '1em' }}
      >
        <p>
          <em>Loading structure data...</em>
        </p>
      </div>
    );
  }

  // Handle invalid/not found data URL
  if (dataUrlStatus === 'invalid') {
    return (
      <AlphaFoldErrorWrapper {...props}>
        <div
          className="wdk-RecordAttributeSectionItem"
          style={{ margin: '1em 0' }}
        >
          <div
            style={{
              padding: '1em',
              color: '#721c24',
              backgroundColor: '#f8d7da',
              border: '1px solid #f5c6cb',
              borderRadius: '4px',
            }}
          >
            <h4>AlphaFold Structure Prediction Visualization not available</h4>
            <p>
              The predicted structure file could not be found. This may be
              because:
            </p>
            <ul style={{ marginTop: '0.5em', marginBottom: '0' }}>
              <li>The structure has not been predicted yet</li>
              <li>The structure file is temporarily unavailable</li>
              <li>
                This gene/protein is not eligible for AlphaFold prediction
              </li>
            </ul>
            {process.env.NODE_ENV !== 'production' && (
              <details open style={{ marginTop: '1em' }}>
                <summary style={{ cursor: 'pointer' }}>
                  Technical details
                </summary>
                <code style={{ fontSize: '0.85em', wordBreak: 'break-all' }}>
                  {dataUrl}
                </code>{' '}
                returns 404 Not Found.
              </details>
            )}
          </div>
        </div>
      </AlphaFoldErrorWrapper>
    );
  }

  // Render normally if data URL is valid
  return (
    <>
      <BlockRecordAttributeSection {...props} />
    </>
  );
}
