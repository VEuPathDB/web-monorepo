import React, { useMemo } from 'react';
import { makeClassNameHelper, wrappable } from '../../../Utils/ComponentUtils';
import { getId, getDisplayName } from '../../../Utils/CategoryUtils';

import { preorderSeq } from '../../../Utils/TreeUtils';

let cx = makeClassNameHelper('wdk-RecordNavigationItem');

let RecordNavigationItem = ({
  node,
  path,
  activeSection,
  checked,
  onSectionToggle,
}) => {
  let id = getId(node);
  let displayName = getDisplayName(node);

  let offerCheckbox = path.length === 1;

  let isActive = useMemo(
    () => preorderSeq(node).some((node) => getId(node) === activeSection),
    [node, activeSection]
  );

  return (
    <div
      className={cx('', isActive ? 'active' : 'inactive')}
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
