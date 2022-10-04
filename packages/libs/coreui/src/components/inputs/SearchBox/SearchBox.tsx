import React, { useMemo } from 'react';
import { merge } from 'lodash';
// use safeHtml for enabling html (e.g., italic) at helpText
import { safeHtml } from '../SelectTree/Utils';
import { Close, Filter } from '../../icons';
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

  styleOverrides?: SearchBoxStyleSpec;
}

export type SearchBoxStyleSpec = {
  helpIcon?: React.CSSProperties;
  optionalIcon?: React.CSSProperties;
  clearSearchIcon?: React.CSSProperties;
  input?: React.CSSProperties;
  container?: React.CSSProperties;
  clearSearchButton?: React.CSSProperties;
}

const searchIconStyleSpec = {
  width: '0.7em',
  height: '0.7em',
  color: '#999999',
  position: 'relative',
  right: '25px',
  top: '4px',
};

const filterIconStyleSpec = {
  fill: '#999999',
  position: 'relative',
  left: '5px',
  fontSize: '1.5em',
}

const defaultStyleSpec: SearchBoxStyleSpec = {
  helpIcon: {
    width: '0.7em',
    height: '0.7em',
    color: '#17b',
    marginLeft: '0.25em',
  },
  optionalIcon: {},
  clearSearchIcon: {
    width: '1em',
    height: '1em',
    fill: '#999999',
  },
  clearSearchButton: {
    background: 'none',
    border: 0,
    position: 'relative',
    margin: 0,
    padding: 0,
    right: '23px',
    top: '2px',
  },
  input: {
    border: '1px solid #888',
    borderRadius: '16px',
    padding: '0.2em 1.5em 0.2em 1em',
    width: '100%',
  },
  container: {
    display: 'flex',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    width: '100%',
    margin: '0 2em',
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
  iconName = 'search',
  styleOverrides = {},
}: Props) {

  const styleSpec: SearchBoxStyleSpec = useMemo(() => {
    const defaultStyleWithIcon = {
      ...defaultStyleSpec,
      optionalIcon: iconName === 'search' ? {...searchIconStyleSpec} : {...filterIconStyleSpec}
    }
    return merge({}, defaultStyleWithIcon, styleOverrides)
  }, [styleOverrides])

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

  const optionalIcon = iconName === 'filter' ? (
    <Filter style={styleSpec.optionalIcon} />
  ) : (
    <Search style={styleSpec.optionalIcon} />
  );

  return (
    <div style={{
      ...styleSpec.container
    }}>
      <label css={{
        flexGrow: 1,
      }}>
        {iconName === 'filter' && !searchTerm ?
          <span style={{
            position: 'absolute',
            height: 0,
            width: 0,
          }}>
            {optionalIcon}
          </span>
          : null
        }
        <input 
          style={{
            ...styleSpec.input, 
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
            style={{
              ...styleSpec.clearSearchButton
            }}
            type="button" 
            onClick={handleResetClick}
          >
            <Close style={styleSpec.clearSearchIcon} />
          </button> :
          iconName === 'search' ?
          <span style={{
            position: 'absolute',
            height: 0,
            width: 0,
          }}>
            {optionalIcon}
          </span>
          : null
        }
      </label>
      {/* use safeHtml for helpText to allow italic */}
      {!helpText ? 
        null : 
        <Tooltip
          title={safeHtml(helpText)}
        >
          <Help style={styleSpec.helpIcon}/>  
        </Tooltip>}
    </div>
  );
}

