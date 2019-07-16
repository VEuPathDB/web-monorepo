/**
 * Simple collapsible section that renders a header and content, along with an
 * icon indicating collapsed status.
 *
 * This is a fully controlled widget.
 */

import { zipWith } from 'lodash';
import React, { useState } from 'react';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';
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

function CollapsibleSection(props: Props) {
  const { className, id, isCollapsed = true, headerContent, children, onCollapsedChange } = props;
  const [ shouldRenderChildren, setShouldRenderChildren ] = useState(!isCollapsed);
  const [ containerClassName, headerClassName, contentClassName ] =
    makeClassNames(isCollapsed, defaultClassName, className);
  const Header = props.headerComponent || 'div';
  const contentStyle = isCollapsed ? { display: 'none' } : undefined;

  function handleCollapsedChange() {
    setShouldRenderChildren(true);
    onCollapsedChange(!isCollapsed);
  }
  return (
    <div id={id} className={containerClassName}>
      <Header className={headerClassName} onClick={handleCollapsedChange}>
        {headerContent}
      </Header>
      <div style={contentStyle} className={contentClassName}>
        {shouldRenderChildren ? children : null}
      </div>
    </div>
  )
}


// Helper to generate class names based on an array of baseNames,
// and then to zip them into a space-separated array of class names.
//
// This will add suffixes to baseNames for the header and content container
// elements.
function makeClassNames(isCollapsed: boolean, ...baseNames: (string|undefined)[]) {
  let classNames = baseNames
  .filter(baseName => baseName != null)
  .map(function(baseName) {
    return ['', 'Header', 'Content']
    .map(function(suffix) {
      return baseName + suffix;
    })
    .map(function(className) {
      return className + (isCollapsed ? ' ' + className + '__collapsed' : '');
    });
  });
  return zipWith(...classNames, function(...args) {
    return args.slice(0, classNames.length).join(' ');
  });
}

export default wrappable(CollapsibleSection);
