import React from 'react';
import { wrappable } from '../../../Utils/ComponentUtils';
import { getId, getDisplayName } from '../../../Utils/CategoryUtils';

let RecordNavigationItem = ({node: category, path, activeCategory, checked, onSectionToggle}) => {
  let id = getId(category);
  let activeId = activeCategory && getId(activeCategory);
  let displayName = getDisplayName(category)

  let enumeration = path.map(n => n + 1).join('.');

  return (
    <div className="wdk-RecordNavigationItem">
      {activeId === id ? (
        <i className="fa fa-circle wdk-Link wdk-RecordNavigationIndicator"/>
      ) : null}
      {path.length == 1 &&
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
          if (checked) onSectionToggle(id, true);
          event.stopPropagation();
        }}
      > {enumeration} {displayName} </a>
    </div>
  );
};

export default wrappable(RecordNavigationItem);
