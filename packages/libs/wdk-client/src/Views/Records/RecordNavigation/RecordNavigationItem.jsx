import React, { useMemo } from 'react';
import { makeClassNameHelper, wrappable } from '../../../Utils/ComponentUtils';
import { getId, getDisplayName } from '../../../Utils/CategoryUtils';

import { preorderSeq } from '../../../Utils/TreeUtils';

let cx = makeClassNameHelper('wdk-RecordNavigationItem');

let RecordNavigationItem = ({ node, activeSection, onSectionToggle }) => {
  let id = getId(node);
  let displayName = getDisplayName(node);
  let isField = node.wdkReference != null;

  let isActive = useMemo(
    () => preorderSeq(node).some((node) => getId(node) === activeSection),
    [node, activeSection]
  );

  return (
    <a
      className={cx(
        '',
        isActive ? 'active' : 'inactive',
        isField ? 'field' : 'category'
      )}
      href={'#' + id}
      onClick={(event) => {
        if (isField) {
          event.stopPropagation();
          onSectionToggle(id, true);
          return;
        }

        const hasChildren =
          event.target.closest('li')?.querySelector('ul') != null;

        // allow toggle if node is active, or if it does not have children
        if (!isActive && hasChildren) {
          event.stopPropagation();
        }
      }}
    >
      {displayName}
    </a>
  );
};

export default wrappable(RecordNavigationItem);
