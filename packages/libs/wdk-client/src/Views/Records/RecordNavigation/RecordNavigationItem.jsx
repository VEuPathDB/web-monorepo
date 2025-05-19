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
      id={'nav-' + id}
      href={'#' + id}
      onClick={(event) => {
        if (isField) {
          onSectionToggle(id, isActive ? undefined : true);
          return;
        }

        // If the category is active, then do not jump to
        // its location on the page, but do allow the nav item
        // to toggle.
        if (isActive) {
          event.preventDefault();
          return;
        }

        const navSectionIsExpanded =
          event.target.closest('li')?.querySelector('ul') != null;

        // Prevent nav section toggle if the corresponding section is not active
        // and the nav section is expanded.
        // In other words, do not collapse the nav section if it is reselected.
        if (navSectionIsExpanded) {
          event.stopPropagation();
        }
      }}
    >
      {displayName}
    </a>
  );
};

export default wrappable(RecordNavigationItem);
