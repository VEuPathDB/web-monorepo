import React from 'react';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';
import { getId, getDisplayName, isIndividual } from 'wdk-client/Utils/CategoryUtils';

let RecordNavigationItem = ({node: category, path, activeCategory, checked, onSectionToggle, isActiveSearch}) => {
  let id = getId(category);
  let activeId = activeCategory && getId(activeCategory);
  let displayName = getDisplayName(category)

  let enumeration = isIndividual(category)
    ? null
    : path.map(n => n + 1).join('.');

  let offerCheckbox = path.length === 1;

  return (
    <div 
      className="wdk-RecordNavigationItem"
      style={{
        margin: isIndividual(category) && !isActiveSearch ? '0.25em 0 0.25em 2em' : '0.25em 0',
        display: 'flex',
        position: 'relative',
      }}
    >
      {activeId === id ? (
        <i 
          className="fa fa-circle wdk-Link wdk-RecordNavigationIndicator"
          style={{
            left: isActiveSearch ? '-1.5em' : '-3em',
            cursor: 'pointer',
          }}  
        />
      ) : null}
      {offerCheckbox &&
        <input
          className="wdk-Record-sidebar-checkbox"
          type="checkbox"
          checked={checked}
          onChange={(e) => void onSectionToggle(id, e.target.checked)}
        />
      }
      <a
        href={'#' + id}
        className="wdk-Record-sidebar-title"
        onClick={event => {
          if (
            !offerCheckbox ||
            checked
          ) onSectionToggle(id, true);
          event.stopPropagation();
        }}
      > {enumeration} {displayName} </a>
    </div>
  );
};

export default wrappable(RecordNavigationItem);
