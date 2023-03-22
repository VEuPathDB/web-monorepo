import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { isEqual, truncate } from 'lodash';
import { RecordInstance, AttributeField } from 'wdk-client/Utils/WdkModel';
import { safeHtml, wrappable } from 'wdk-client/Utils/ComponentUtils';
import { Tooltip } from '@veupathdb/components/lib/components/widgets/Tooltip';
import { useIsRefOverflowingHorizontally } from 'wdk-client/Hooks/Overflow';

interface AttributeCellProps {
  attribute: AttributeField;
  recordInstance: RecordInstance;
}

function AttributeCell(props: AttributeCellProps) {
  const { attribute, recordInstance } = props;
  const attributeValue = recordInstance.attributes[attribute.name];
  const key = typeof attributeValue === 'string' ? attributeValue : attributeValue?.displayText || attributeValue?.url || '';
  return <AttributeCellInner {...props} key={key} />;
}

function AttributeCellInner({
  attribute,
  recordInstance,
}: AttributeCellProps) {
  const value = recordInstance.attributes[attribute.name];
  const defaultStyleSpec: React.CSSProperties = {
    whiteSpace: 'nowrap',
    maxWidth: `${attribute.truncateTo}ch`,
  };
  const ref = useRef<HTMLDivElement>(null);
  const [ styleSpec, setStyleSpec ] = useState<React.CSSProperties>(defaultStyleSpec);
  const isOverflowing = useIsRefOverflowingHorizontally(ref);
  
  useLayoutEffect(() => {
    if (!ref.current) return;
    if (
      ref.current.innerText.length > attribute.truncateTo &&
      isEqual(styleSpec, defaultStyleSpec) &&
      isOverflowing
      ) {
        setStyleSpec({
          ...defaultStyleSpec,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        })
      }
  });

  useEffect(() => {
    setStyleSpec(defaultStyleSpec)
  }, [value]);

  if (value == null) return null;

  if (typeof value === 'string') {
    const cellContent = 
      safeHtml(value, {
        style: styleSpec,
        ref,
      }, 'div');
    return !('overflow' in styleSpec) ? cellContent : <Tooltip title={ref.current?.innerText ?? ''} interactive>{cellContent}</Tooltip>
  }

  const { url, displayText } = value;
  const display = displayText || url;
  const truncatedDisplay = truncateValue(display, attribute.truncateTo);
  return (
    <div title={truncatedDisplay !== display ? display : undefined}>
      <a
        href={url}
        dangerouslySetInnerHTML={{
          __html: truncatedDisplay
        }}
      />
    </div>
  );
}

export default wrappable(AttributeCell);

function truncateValue(value: string, length: number) {
  return length ? truncate(value, { length }) : value;
}
