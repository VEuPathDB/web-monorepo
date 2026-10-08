import { ReactNode, useEffect, useRef, useState } from 'react';
import { useStorageBackedState } from '@veupathdb/wdk-client/lib/Hooks/StorageBackedState';
import {
  arrayOf,
  decodeOrElse,
  string,
} from '@veupathdb/wdk-client/lib/Utils/Json';
import { addRecentSearch } from '../util/recentSearches';

const STORAGE_KEY = 'ortho/table-search/history';

const parseHistory = (value: string) =>
  decodeOrElse(arrayOf(string), [], value);

interface Props {
  /** The search box, which this wraps so the history can drop down beneath it. */
  children: ReactNode;
  searchTerm: string;
  /** Called with the chosen history entry. */
  onSelect: (term: string) => void;
}

/**
 * Adds a "Your recent searches" pop-down to a search box, in the manner of the
 * site search. History is shared across groups. Terms are remembered when the
 * box loses focus or Enter is pressed, not while typing, so partial words
 * aren't kept.
 */
export function RecentSearchesDropdown({
  children,
  searchTerm,
  onSelect,
}: Props) {
  const [recent, setRecent] = useStorageBackedState<string[]>(
    window.localStorage,
    [],
    STORAGE_KEY,
    JSON.stringify,
    parseHistory
  );
  const [hasFocus, setHasFocus] = useState(false);
  // What is in the box right now. The box debounces its change callback, so
  // `searchTerm` can lag a few hundred ms behind typing.
  const [typedTerm, setTypedTerm] = useState(searchTerm);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => setTypedTerm(searchTerm), [searchTerm]);

  // Latest values for the unmount and pagehide paths, which outlive any one render.
  const latest = useRef({ recent, typedTerm, setRecent });
  latest.current = { recent, typedTerm, setRecent };

  const remember = useRef(() => {
    const { recent, typedTerm, setRecent } = latest.current;
    const updated = addRecentSearch(recent, typedTerm);
    if (updated !== recent) setRecent(updated);
  }).current;

  useEffect(() => {
    const closeOnOutsideClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setHasFocus(false);
      }
    };
    document.addEventListener('click', closeOnOutsideClick);
    // Blur doesn't fire when the box is unmounted or the page is closed or reloaded.
    window.addEventListener('pagehide', remember);
    return () => {
      document.removeEventListener('click', closeOnOutsideClick);
      window.removeEventListener('pagehide', remember);
      remember();
    };
  }, [remember]);

  const select = (term: string) => {
    onSelect(term);
    setHasFocus(false);
  };

  // Like the site search, offer history only while there is nothing typed.
  const showHistory = hasFocus && typedTerm === '' && recent.length > 0;

  const moveFocus = (e: React.KeyboardEvent, direction: 1 | -1) => {
    const items = Array.from(
      listRef.current?.querySelectorAll<HTMLElement>('li[tabindex]') ?? []
    );
    const index = items.indexOf(e.target as HTMLElement);
    const next = items[index + direction];
    if (next) {
      e.preventDefault();
      next.focus();
    }
  };

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative' }}
      onFocus={(e) => {
        if (e.target instanceof HTMLInputElement) setHasFocus(true);
      }}
      onChange={(e) => setTypedTerm((e.target as HTMLInputElement).value)}
      onBlur={remember}
      onKeyDown={(e) => {
        if (e.key === 'Enter') remember();
        if (e.key === 'Escape') setHasFocus(false);
        if (showHistory && e.key === 'ArrowDown') moveFocus(e, 1);
        if (e.key === 'ArrowUp' && e.target instanceof HTMLLIElement)
          moveFocus(e, -1);
      }}
    >
      {children}
      {showHistory && (
        <ul
          ref={listRef}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 10,
            margin: '0.2em 0 0',
            padding: 0,
            listStyle: 'none',
            background: '#ededed',
            borderRadius: '1em',
            boxShadow: '0 0 1em rgba(0, 48, 76, 0.5)',
            overflow: 'hidden',
          }}
        >
          <li style={{ padding: '0.2em 1em' }}>
            <strong>Your recent searches</strong>
          </li>
          {recent.map((term) => (
            <HistoryItem key={term} onActivate={() => select(term)}>
              {term}
            </HistoryItem>
          ))}
          <HistoryItem onActivate={() => setRecent([])} link>
            Clear search history
          </HistoryItem>
        </ul>
      )}
    </div>
  );
}

function HistoryItem(props: {
  children: ReactNode;
  onActivate: () => void;
  link?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <li
      tabIndex={0}
      style={{
        padding: '0.2em 1em',
        cursor: 'pointer',
        background: hovered ? '#dedede' : undefined,
        color: props.link ? '#0b5394' : undefined,
        textDecoration: props.link ? 'underline' : undefined,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      onClick={props.onActivate}
      onKeyDown={(e) => {
        if (e.key === 'Enter') props.onActivate();
      }}
    >
      {props.children}
    </li>
  );
}
