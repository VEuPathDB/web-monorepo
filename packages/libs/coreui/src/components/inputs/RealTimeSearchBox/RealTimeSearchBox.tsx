import { debounce } from 'lodash';
import React, { useRef } from 'react';
// use safeHtml for enabling html (e.g., italic) at helpText
import { safeHtml } from '../SelectTree/Utils';
import { Close } from '../../icons';
import { Help, Search } from '@material-ui/icons';
import { Tooltip } from '@material-ui/core';

type Props = {

  /** Set the autofocus property of the underlying HTMLTextInputElement */
  autoFocus?: boolean;

  /** Initial search text; defaults to ''.  After mounting, search text is maintained by the component */
  searchTerm?: string;

  /** Called when user alters text in the search box  */
  onSearchTermChange?: (searchTerm: string) => void;

  /** The placeholder string if no search text is present; defaults to ''. */
  placeholderText?: string;

  /** Icon name to show in input box. Defaults to "search". */
  iconName?: string;

  /** Text to appear as tooltip of help icon, should describe how the search is performed. Defaults to empty (no icon) */
  helpText?: string;

  /** Delay in milliseconds after last character typed until onSearchTermChange is called.  Defaults to 250. */
  delayMs?: number;

}

// type State = {
//   /** local reference to search term for rendering */
//   searchTerm: string;
// }

const defaultStyle = {
  helpIcon: {
    width: '0.7em',
    height: '0.7em',
  },
  searchIcon: {
    width: '0.7em',
    height: '0.7em',
    color: '#999999',
  },
  clearSearchIcon: {
    width: '1em',
    height: '1em',
    fill: '#999999',
  }
}

/**
 * A 'real time' search box.  Changes are throttled by 'debounce' so text
 * change events are delayed to prevent repetitive costly searching.  Useful
 * when expensive operations are performed (e.g. search) in real time as the
 * user types in the box.  Also provides reset button to clear the box.
 */
// export default class RealTimeSearchBox extends Component<Props, State> {
export default function RealTimeSearchBox({
  autoFocus = false,
  searchTerm = '',
  onSearchTermChange = () => {},
  placeholderText = '',
  helpText = '',
  delayMs = 250,
  iconName = 'search',
}: Props) {

  const inputRef = useRef<HTMLInputElement>(null);

  const emitSearchTermChange = debounce((searchTerm: string) => onSearchTermChange!(searchTerm));

  let input: HTMLInputElement | null = null;

  /**
   * Update the state of this Component, and call debounced onSearchTermSet
   * callback.
   */
  function handleSearchTermChange(e: React.ChangeEvent<HTMLInputElement>) {
    let searchTerm = e.currentTarget.value;
    emitSearchTermChange(searchTerm);
  }

  /**
   * Reset input if Escape is pressed.
   */
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      onSearchTermChange!('');
      e.stopPropagation();
    }
  }

  /**
   * Update the state of this Component, and call onSearchTermSet callback
   * immediately.
   */
  function handleResetClick() {
    onSearchTermChange!('');
  }

  let isActiveSearch = searchTerm.length > 0;
  let activeModifier = isActiveSearch ? 'active' : 'inactive';
  let helpModifier = helpText ? 'withHelp' : '';
    return (
      <div css={{
        display: 'flex',
        alignItems: 'center',
      }}>
        <label>
          <input type="search"
            autoFocus={autoFocus}
            ref={node => input = node}
            onChange={handleSearchTermChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholderText}
            value={searchTerm}
          />
          {searchTerm ?
            <button
              css={{
                background: 'none',
                border: 0,
                position: 'relative',
                margin: 0,
                padding: 0,
                right: '18px',
                top: '2px',
              }}
              type="button" 
              onClick={handleResetClick}
            >
              <Close style={defaultStyle.clearSearchIcon} />
            </button> :
            <span css={{
              position: 'relative',
              right: '20px',
              top: '4px'
            }}>
              <Search style={defaultStyle.searchIcon} />
            </span>
          }
        </label>
        {/* use safeHtml for helpText to allow italic */}
        {!helpText ? 
          null : 
          <Tooltip
            title={safeHtml(helpText)}
          >
            <Help style={defaultStyle.helpIcon}/>  
          </Tooltip>}
      </div>
    );
  }

