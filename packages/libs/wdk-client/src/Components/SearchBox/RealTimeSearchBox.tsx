import HelpIcon from '../../Components/Icon/HelpIcon';
import React, { useEffect, useState } from 'react';
import '../../Components/SearchBox/RealTimeSearchBox.css';
// use safeHtml for enabling html (e.g., italic) at helpText
import { safeHtml } from '../../Utils/ComponentUtils';

/** classNames used by component */
const baseClassName = 'wdk-RealTimeSearchBox';
const inputClassName = baseClassName + 'Input';
const labelClassName = baseClassName + 'Label';
const cancelBtnClassName = baseClassName + 'CancelBtn';
const infoIconClassName = baseClassName + 'InfoIcon';
const cancelIconClassName = baseClassName + 'CancelIcon';
const searchIconClassName = baseClassName + 'SearchIcon';

type Props = {
  /** Class name to include with default class name */
  className?: string;

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

  /** Additional right positioning for the "cancel" button when used in DataTable's column filters */
  cancelBtnRightMargin?: React.CSSProperties['right'];
};

/**
 * A 'real time' search box.  Changes are throttled by 'debounce' so text
 * change events are delayed to prevent repetitive costly searching.  Useful
 * when expensive operations are performed (e.g. search) in real time as the
 * user types in the box.  Also provides reset button to clear the box.
 */
export default function RealTimeSearchBox(props: Props) {
  const {
    className,
    helpText,
    placeholderText,
    autoFocus,
    iconName,
    cancelBtnRightMargin,
    onSearchTermChange,
    delayMs,
  } = props;
  const [searchTerm, setSearchTerm] = useState(props.searchTerm ?? '');
  const isActiveSearch = searchTerm.length > 0;
  const activeModifier = isActiveSearch ? 'active' : 'inactive';
  const helpModifier = helpText ? 'withHelp' : '';

  useEffect(() => {
    if (onSearchTermChange) {
      const id = setTimeout(onSearchTermChange, 250, searchTerm);
      return function cancel() {
        clearTimeout(id);
      };
    }
  }, [delayMs, searchTerm, onSearchTermChange]);

  return (
    <div
      className={
        classname(baseClassName, activeModifier, helpModifier) +
        ' ' +
        classname(className!, activeModifier, helpModifier)
      }
    >
      <label className={labelClassName}>
        <input
          type="search"
          autoFocus={autoFocus}
          className={inputClassName}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.stopPropagation();
              setSearchTerm('');
            }
          }}
          placeholder={placeholderText}
          value={searchTerm}
        />
        <i className={`fa fa-${iconName} ${searchIconClassName}`} />
        <button
          className={cancelBtnClassName}
          style={
            cancelBtnRightMargin ? { right: cancelBtnRightMargin } : undefined
          }
          type="button"
          onClick={() => setSearchTerm('')}
        >
          <i className={'fa fa-close ' + cancelIconClassName} />
        </button>
      </label>
      {/* use safeHtml for helpText to allow italic */}
      {!helpText ? null : <HelpIcon>{safeHtml(helpText)}</HelpIcon>}
    </div>
  );
}

/**
 * Produce BEM style class names. The return value is a space-delimited
 * list of class names. The first is `base`, and the rest are generated
 * by joining `base` and each of `modifiers` with '__'.
 *
 * @example
 * let allClassNames = className('Thing', 'active', 'blue');
 * //=> 'Thing Thing__active Thing__blue'
 */
function classname(base: string, ...modifiers: string[]): string {
  return modifiers.reduce((classnames, modifier) => {
    return modifier ? classnames + ' ' + base + '__' + modifier : classnames;
  }, base);
}
