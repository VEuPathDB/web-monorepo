import React from 'react';
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
}

const defaultStyle = {
  helpIcon: {
    width: '0.7em',
    height: '0.7em',
    marginLeft: '0.5em',
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
  },
  searchBox: {
    border: '1px solid #888',
    borderRadius: '16px',
    padding: '0.2em 1.5em 0.2em 1em',
  }
}

/**
 * Consider using 'debounce' to throttle changes in parent component if 
 * expensive operations are performed (e.g. search) in real time as the
 * user types in the box.
 */
export default function SearchBox({
  autoFocus = false,
  searchTerm = '',
  onSearchTermChange = () => {},
  placeholderText = '',
  helpText = '',
}: Props) {

  function handleSearchTermChange(e: React.ChangeEvent<HTMLInputElement>) {
    let searchTerm = e.currentTarget.value;
    onSearchTermChange(searchTerm);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      onSearchTermChange!('');
      e.stopPropagation();
    }
  }

  function handleResetClick() {
    onSearchTermChange!('');
  }

  return (
    <div css={{
      display: 'flex',
      alignItems: 'center',
      whiteSpace: 'nowrap',
    }}>
      <label>
        <input 
          css={{
            ...defaultStyle.searchBox, 
            width: 'calc(100% - 2em)'
          }}
          type="search"
          autoFocus={autoFocus}
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
              right: '23px',
              top: '2px',
            }}
            type="button" 
            onClick={handleResetClick}
          >
            <Close style={defaultStyle.clearSearchIcon} />
          </button> :
          <span css={{
            position: 'relative',
            right: '25px',
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

