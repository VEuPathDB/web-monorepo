import React, { useMemo } from 'react';
import { merge } from 'lodash';
// use safeHtml for enabling html (e.g., italic) at helpText
import { safeHtml } from '../SelectTree/Utils';
import { Close, Filter } from '../../icons';
import { Help, Search } from '@material-ui/icons';
import { Theme, Tooltip, withStyles } from '@material-ui/core';

const StyledTooltip = withStyles((theme: Theme) => ({
  tooltip: {
    backgroundColor: '#fffde7',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 320,
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9',
    boxShadow: theme.shadows[1],
  },
}))(Tooltip);

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
  iconName?: 'search' | 'filter';

  /** Specifies where icon should be placed within input box. Defaults to "right". */
  iconPosition?: 'left' | 'right';

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
  top: '2px',
  fontSize: '1.5em',
}

const defaultStyleSpec: SearchBoxStyleSpec = {
  helpIcon: {
    width: '0.7em',
    height: '0.7em',
    color: '#17b',
    marginLeft: '0.25em',
    cursor: 'pointer',
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
    width: 'calc(100% - 3em)',
    textOverflow: 'ellipsis',
    background: '#fff',
  },
  container: {
    display: 'flex',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    width: '100%',
    margin: '0 0.5em',
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
  iconPosition = 'right',
  styleOverrides = {},
}: Props) {

  const styleSpec: SearchBoxStyleSpec = useMemo(() => {
    const defaultStyleWithIconSpecs = {
      ...defaultStyleSpec,
      input: {
        ...defaultStyleSpec.input,
        padding: iconPosition === 'right' ? '0.2em 2em 0.2em 1em' : '0.2em 1em 0.2em 2em',
      },
      optionalIcon: 
        iconName === 'search' ? {...searchIconStyleSpec} : 
          iconPosition === 'right' ? {...filterIconStyleSpec, right: '25px'} : {...filterIconStyleSpec, left: '5px'}
    }
    return merge({}, defaultStyleWithIconSpecs, styleOverrides)
  }, [styleOverrides, iconName, iconPosition])

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

  /** 
   * At this point we only use two different icons in search bars: 'filter' and 'search'
  */
  const optionalIcon = iconName === 'search' ? (
    <Search style={styleSpec.optionalIcon} />
  ) : (
    <Filter style={styleSpec.optionalIcon} />
  );

  return (
    <div style={{
      ...styleSpec.container
    }}>
      <label css={{
        flexGrow: 1,
      }}>
        {iconPosition === 'left' && !searchTerm ?
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
          iconPosition === 'right' ?
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
        <StyledTooltip
          title={safeHtml(helpText)}
          interactive
        >
          <Help style={styleSpec.helpIcon}/>  
        </StyledTooltip>}
    </div>
  );
}

