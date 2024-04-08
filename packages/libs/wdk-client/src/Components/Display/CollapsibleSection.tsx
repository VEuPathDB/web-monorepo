/**
 * Simple collapsible section that renders a header and content, along with an
 * icon indicating collapsed status.
 *
 * This is a fully controlled widget.
 */

import { zipWith } from 'lodash';
import React, { useState, useEffect, useCallback } from 'react';
import { wrappable } from '../../Utils/ComponentUtils';
import './CollapsibleSection.css';

interface Props {
  id?: string;
  isCollapsed?: boolean;
  onCollapsedChange: (isCollapsed: boolean) => void;
  headerContent: React.ReactNode;
  headerComponent?: React.ReactType;
  className?: string;
  children: React.ReactNode;
}

const defaultClassName = 'wdk-CollapsibleSection';

// Make the button unstyled so it does not alter the layout of the page
// but we still get the accessibility benefits of a button.
const buttonStyle: React.CSSProperties = {
  border: 'none',
  background: 'none',
  display: 'block',
  width: '100%',
  textAlign: 'left',
  padding: 0,
};

function CollapsibleSection(props: Props) {
  const {
    className,
    id,
    isCollapsed = true,
    headerContent,
    children,
    onCollapsedChange,
  } = props;
  const [shouldRenderChildren, setShouldRenderChildren] = useState(
    !isCollapsed
  );
  const [containerClassName, headerClassName, contentClassName] =
    makeClassNames(isCollapsed, defaultClassName, className);
  const Header = props.headerComponent || 'div';
  const contentStyle = isCollapsed ? { display: 'none' } : undefined;

  useEffect(() => {
    if (shouldRenderChildren || isCollapsed) return;
    setShouldRenderChildren(true);
  }, [isCollapsed, shouldRenderChildren]);

  const handleCollapsedChange = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      event.currentTarget.blur();
      event.stopPropagation();
      onCollapsedChange(!isCollapsed);
    },
    [isCollapsed, onCollapsedChange]
  );

  return (
    <div id={id} className={containerClassName}>
      <button style={buttonStyle} type="button" onClick={handleCollapsedChange}>
        <Header className={headerClassName}>{headerContent}</Header>
      </button>
      <div style={contentStyle} className={contentClassName}>
        {shouldRenderChildren ? children : null}
      </div>
    </div>
  );
}

// Helper to generate class names based on an array of baseNames,
// and then to zip them into a space-separated array of class names.
//
// This will add suffixes to baseNames for the header and content container
// elements.
function makeClassNames(
  isCollapsed: boolean,
  ...baseNames: (string | undefined)[]
) {
  let classNames = baseNames
    .filter((baseName) => baseName != null)
    .map(function (baseName) {
      return ['', 'Header', 'Content']
        .map(function (suffix) {
          return baseName + suffix;
        })
        .map(function (className) {
          return (
            className + (isCollapsed ? ' ' + className + '__collapsed' : '')
          );
        });
    });
  return zipWith(...classNames, function (...args) {
    return args.slice(0, classNames.length).join(' ');
  });
}

export default wrappable(CollapsibleSection);
