import React, { useMemo } from 'react';
import { makeClassNameHelper, wrappable } from '../../../Utils/ComponentUtils';
import { getId, getDisplayName } from '../../../Utils/CategoryUtils';

import { preorderSeq } from '../../../Utils/TreeUtils';

let cx = makeClassNameHelper('wdk-RecordNavigationItem');

let RecordNavigationItem = ({ node, activeSection, onSectionToggle }) => {
  let id = getId(node);
  let displayName = getDisplayName(node);

  let isActive = useMemo(
    () => preorderSeq(node).some((node) => getId(node) === activeSection),
    [node, activeSection]
  );

  return (
    <a
      className={cx('', isActive ? 'active' : 'inactive')}
      href={'#' + id}
      onClick={(event) => {
        event.stopPropagation();
        if (node.wdkReference != null) {
          onSectionToggle(id, true);
        }
      }}
    >
      {displayName}
    </a>
  );
};

export default wrappable(RecordNavigationItem);
