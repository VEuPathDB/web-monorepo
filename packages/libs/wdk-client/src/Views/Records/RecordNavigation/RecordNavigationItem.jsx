import React, { useMemo } from 'react';
import { makeClassNameHelper, wrappable } from '../../../Utils/ComponentUtils';
import { getId, getDisplayName } from '../../../Utils/CategoryUtils';

import { preorderSeq } from '../../../Utils/TreeUtils';

let cx = makeClassNameHelper('wdk-RecordNavigationItem');

let RecordNavigationItem = ({ node, path, activeSection, onSectionToggle }) => {
  let id = getId(node);
  let displayName = getDisplayName(node);
  let isField = node.wdkReference != null;
  let depth = (path?.length ?? 1) - 1;

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

        // Non-top-level category sections are individually collapsible in
        // RecordMainSection (see RecordMainCategorySection), unlike
        // top-level (depth 0) categories, which are always rendered
        // expanded. Expand the section being navigated to, the same way
        // field sections are expanded above.
        if (depth > 0) {
          onSectionToggle(id, true);
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
