import { css } from '@emotion/react';
import { KeyboardEvent } from 'react';

interface RecentSearchesMenuProps {
  recentSearches: string[];
  onSelect: (recentSearch: string) => void;
  onClear: () => void;
  /** Added to every item, for a host that styles them further. */
  itemClassName?: string;
}

const itemStyle = css({
  padding: '0.2em 1em',
  textAlign: 'left',
  '&[tabindex]': {
    cursor: 'pointer',
    '&:hover, &:focus, &:active': { background: '#dedede' },
  },
});

/**
 * The items of a "Your recent searches" pop-down: a heading, the searches and
 * a "Clear search history" link. Renders only the `<li>`s, to go inside the
 * host's own `<ul>`, which positions and decorates the pop-down. Items are
 * focusable and activate with Enter or a click. Renders nothing when there
 * are no recent searches.
 */
export function RecentSearchesMenu({
  recentSearches,
  onSelect,
  onClear,
  itemClassName = '',
}: RecentSearchesMenuProps) {
  if (recentSearches.length === 0) return null;

  const activatable = (activate: () => void) => ({
    tabIndex: 0,
    onClick: activate,
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === 'Enter') activate();
    },
  });

  return (
    <>
      <li css={itemStyle} className={itemClassName}>
        <strong>Your recent searches</strong>
      </li>
      {recentSearches.map((recentSearch) => (
        <li
          key={recentSearch}
          css={itemStyle}
          className={itemClassName}
          {...activatable(() => onSelect(recentSearch))}
        >
          {recentSearch}
        </li>
      ))}
      <li
        css={itemStyle}
        className={`${itemClassName} link`}
        {...activatable(onClear)}
      >
        Clear search history
      </li>
    </>
  );
}
