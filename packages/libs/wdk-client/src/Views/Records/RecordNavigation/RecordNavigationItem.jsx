import React from 'react';
import { makeClassNameHelper, wrappable } from '../../../Utils/ComponentUtils';
import {
  getId,
  getDisplayName,
  isIndividual,
} from '../../../Utils/CategoryUtils';

let cx = makeClassNameHelper('wdk-RecordNavigationItem');

let RecordNavigationItem = ({
  node,
  path,
  activeCategory,
  checked,
  onSectionToggle,
}) => {
  let id = getId(node);
  let activeId = activeCategory && getId(activeCategory);
  let displayName = getDisplayName(node);

  let enumeration = isIndividual(node)
    ? null
    : path.map((n) => n + 1).join('.');

  let offerCheckbox = path.length === 1;

  return (
    <div
      className={cx('', activeId === id ? 'active' : 'inactive')}
      style={{
        display: 'flex',
        position: 'relative',
      }}
    >
      <a
        href={'#' + id}
        className="wdk-Record-sidebar-title"
        onClick={(event) => {
          if (!offerCheckbox || checked) onSectionToggle(id, true);
          event.stopPropagation();
        }}
      >
        {' '}
        {displayName}{' '}
      </a>
    </div>
  );
};

export default wrappable(RecordNavigationItem);
