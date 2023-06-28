import React, { useEffect, useRef, useState } from 'react';
import { SEARCH_TERM_PARAM } from './SiteSearchConstants';

import './SiteSearch.scss';

// region Keyboard

//
// Keyboard Event Helper Functions.
//

/**
 * Tests whether the keyboard event had a modifier key press present.
 *
 * @param e Keyboard event to test.
 *
 * @return `true` if the keyboard event had a modifier key press present,
 * otherwise `false`.
 */
const kbHasModifier = (e: React.KeyboardEvent<any>) =>
  e.altKey || e.metaKey || e.ctrlKey || e.shiftKey;

/**
 * Tests whether the keyboard event had ONLY the "shift" modifier key press
 * present.
 *
 * @param e Keyboard event to test.
 *
 * @return `true` if the keyboard event had the "shift" modifier and only the
 * "shift" modifier press present, otherwise `false`.
 */
const kbHasOnlyShiftMod = (e: React.KeyboardEvent<any>) =>
  !(e.altKey || e.metaKey || e.ctrlKey) && e.shiftKey;

/**
 * Tests whether the keyboard event was for a "Tab" key press.
 *
 * @param e Keyboard event to test.
 *
 * @return `true` if the keyboard event was for a "Tab" key press, otherwise
 * `false`.
 */
const kbIsTab = (e: React.KeyboardEvent<any>) =>
  e.code === 'Tab' || e.keyCode == 9;

/**
 * Tests whether the keyboard event was for a "Space" key press.
 *
 * @param e Keyboard event to test.
 *
 * @return `true` if the keyboard event was for a "Space" key press, otherwise
 * `false`.
 */
const kbIsSpace = (e: React.KeyboardEvent<any>) =>
  e.code === 'Space' || e.keyCode == 32;

/**
 * Tests whether the keyboard event was for an "ArrowRight" key press.
 *
 * @param e Keyboard event to test.
 *
 * @return `true` if the keyboard event was for an "ArrowRight" key press,
 * otherwise `false`.
 */
const kbIsArrowRight = (e: React.KeyboardEvent<any>) =>
  e.code === 'ArrowRight' || e.keyCode == 39;

/**
 * Tests whether the keyboard event was for an "ArrowDown" key press.
 *
 * @param e Keyboard event to test.
 *
 * @return `true` if the keyboard event was for an "ArrowDown" key press,
 * otherwise `false`.
 */
const kbIsArrowDown = (e: React.KeyboardEvent<any>) =>
  e.code === 'ArrowDown' || e.keyCode == 40;

/**
 * Tests whether the keyboard event was for an "ArrowUp" key press.
 *
 * @param e Keyboard event to test.
 *
 * @return `true` if the keyboard event was for an "ArrowUp" key press,
 * otherwise `false`.
 */
const kbIsArrowUp = (e: React.KeyboardEvent<any>) =>
  e.code === 'ArrowUp' || e.keyCode == 38;

/**
 * Tests whether the keyboard event was for an "Enter" key press.
 *
 * @param e Keyboard event to test.
 *
 * @return `true` if the keyboard event was for an "Enter" key press, otherwise
 * `false`.
 */
const kbIsEnter = (e: React.KeyboardEvent<any>) =>
  e.code === 'Enter' || e.keyCode == 13;

/**
 * Tests whether the keyboard event was for an "Escape" key press.
 *
 * @param e Keyboard event to test.
 *
 * @return `true` if the keyboard event was for an "Escape" key press, otherwise
 * `false`.
 */
const kbIsEscape = (e: React.KeyboardEvent<any>) =>
  e.code === 'Escape' || e.keyCode == 27;

// endregion Keyboard

// region Strings

//
// String Helper Functions
//

/**
 * Returns the last word of the given string.
 *
 * @param value String from which the last word should be returned.
 *
 * @return The last word of the given string.
 */
const lastWordOf = (value: string) =>
  ((arr: Array<string>) => (arr.length > 0 ? arr[arr.length - 1] : ''))(
    value.split(/ +/)
  );

/**
 * Replaces the last word in the given `original` string with the given
 * `replacement` word(s), returning the new string.
 *
 * @param original Original string whose last word should be replaced.
 *
 * @param replacement Word that will replace the last word of the original
 * string.
 *
 * @return A new string formed by replacing the last word of the `original`
 * string with the given `replacement`.
 */
const replaceLastWord = (original: string, replacement: string) =>
  original.substring(0, original.lastIndexOf(lastWordOf(original))) +
  replacement;

// endregion Strings

// region Debouncer

/**
 * Debouncer Function Type.
 *
 * Represents a function that may be used to build a "debounced" or "debouncing"
 * function by passing in a target function that takes a value of type `T` and
 * returns nothing.
 *
 * The return value of a Debouncer function call will be a new function that
 * wraps the given target function with debouncing.
 *
 * @param T Type of the value consumed by the function wrapped by and returned
 * by the Debouncer function.
 */
type Debouncer<T> = (func: (value: T) => void) => (value: T) => void;


/**
 * Builds a new `Debouncer` function that may be used to build one or more
 * functions that debounce on the same timer.
 *
 * @param delay Debouncing delay.
 *
 * @return A `Debouncer` function that may be used to build one or more
 * functions that debounce on the same timer.
 */
function buildDebouncer<T>(delay: number): Debouncer<T> {
  let timer: any;

  return (func: (value: T) => any) => {
    return (value: T) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(value), delay);
    };
  };
}

// endregion Debouncer

// region TypeAheadAPI

const TYPEAHEAD_PATH: string = 'suggest';

/**
 * Wrapper for the SiteSearch Type-Ahead HTTP API.
 */
class TypeAheadAPI {
  private apiEndpoint: string;

  constructor(endpoint: string) {
    this.apiEndpoint =
      (endpoint.endsWith('/') ? endpoint : endpoint + '/') + TYPEAHEAD_PATH;
  }

  /**
   * Runs a type-ahead query against the HTTP API and calls the given callback
   * (`cb`) with the results.
   *
   * @param query Type-Ahead query to be used to retrieve completion
   * suggestions.
   *
   * @param cb Callback that will be called with the results of the API query.
   */
  typeAhead(query: string, cb: (values: Array<string>) => any) {
    console.log(query);
    fetch(this.apiEndpoint + '?searchText=' + encodeURIComponent(query))
      .then(this.requireValidResult)
      .then(cb);
  }

  private async requireValidResult(value: Response): Promise<Array<string>> {
    const json = await value.json();

    if (!(json instanceof Array))
      throw new Error('type-ahead API response was not an array!');

    if ((json as Array<any>).length == 0) return json as Array<string>;

    for (const entry of json as Array<any>) {
      if (typeof entry != 'string') {
        throw new Error(
          'type-ahead API response contained a non-string value!'
        );
      }
    }

    return json as Array<string>;
  }
}

// endregion TypeAheadAPI

// region TypeAheadInput

const debounce = buildDebouncer<() => string>(250);

export interface TypeAheadInputProps {
  readonly siteSearchURL: string;
  readonly inputReference: React.RefObject<HTMLInputElement>;
  readonly searchString: string;
  readonly placeHolderText?: string;
}

export function TypeAheadInput(props: TypeAheadInputProps): JSX.Element {
  const [suggestions, setSuggestions] = useState<Array<string>>([]);
  const [hintValue, setHintValue] = useState('');
  const [inputValue, setInputValue] = useState('');

  const typeAheadAPI = new TypeAheadAPI("https://178c-2600-4040-70fa-ee00-a236-2c1e-6c12-f4c9.ngrok-free.app"); // props.siteSearchURL);
  const ulReference = useRef<HTMLUListElement>(null);
  const ulClassName =
    suggestions.length == 0 ? 'type-ahead-hints hidden' : 'type-ahead-hints';

  const showHint = (hint: string) => {
    if (inputValue.length == 0) {
      setHintValue(hint);
    } else if (hint.startsWith(lastWordOf(inputValue))) {
      setHintValue(replaceLastWord(inputValue, hint));
    } else {
      setHintValue(inputValue + ' ' + hint);
    }
  };

  const resetInput = () => {
    props.inputReference.current?.focus();
    setSuggestions([]);
  };

  const resetHint = () => {
    setHintValue(inputValue);
  };

  const selectHint = () => {
    setInputValue(hintValue + ' ');
    resetInput();
  };

  const onLiKeyDown = (
    e: React.KeyboardEvent<HTMLLIElement>,
    suggestion: string
  ) => {
    if (kbHasModifier(e)) {
      if (kbHasOnlyShiftMod(e) && kbIsTab(e)) {
        e.preventDefault();
        e.stopPropagation();

        if (ulReference.current?.firstElementChild === e.currentTarget) {
          props.inputReference.current?.focus();
        } else {
          (
            e.currentTarget.previousElementSibling as HTMLLIElement | null
          )?.focus();
        }
      } else {
        return;
      }
    } else if (kbIsSpace(e) || kbIsArrowRight(e)) {
      e.preventDefault();
      e.stopPropagation();
      selectHint();
    } else if (kbIsEnter(e)) {
      selectHint();
    } else if (kbIsArrowUp(e)) {
      e.preventDefault();
      e.stopPropagation();
      if (ulReference.current?.firstElementChild === e.currentTarget) {
        props.inputReference.current?.focus();
      } else {
        (
          e.currentTarget.previousElementSibling as HTMLLIElement | null
        )?.focus();
      }
    } else if (kbIsArrowDown(e) || kbIsTab(e)) {
      e.preventDefault();
      e.stopPropagation();

      if (ulReference.current?.lastElementChild === e.currentTarget) {
        (
          ulReference.current?.firstElementChild as HTMLLIElement | null
        )?.focus();
      } else {
        (e.currentTarget.nextElementSibling as HTMLLIElement | null)?.focus();
      }
    } else if (kbIsEscape(e)) {
      resetInput();
    }
  };

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (kbHasModifier(e)) {
      return;
    } else if (kbIsArrowDown(e)) {
      e.preventDefault();
      e.stopPropagation();
      (ulReference.current?.firstElementChild as HTMLLIElement | null)?.focus();
    } else if (kbIsArrowUp(e)) {
      e.preventDefault();
      e.stopPropagation();
      (ulReference.current?.lastElementChild as HTMLLIElement | null)?.focus();
      // } else if (kbIsEnter(e)) {
      //   props.formReference.current?.submit();
    } else if (kbIsEscape(e)) {
      resetInput();
    }
  };

  const typeAhead = debounce((fn: () => string) => {
    const value = fn();
    if (lastWordOf(value).length >= 3)
      typeAheadAPI.typeAhead(lastWordOf(value), setSuggestions);
  });

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const element = e.currentTarget;

    setInputValue(element.value);
    setHintValue(element.value);
    setSuggestions([]);

    if (lastWordOf(element.value).length >= 3) typeAhead(() => element.value);
  };

  const suggestionItems = suggestions.map((suggestion) => (
    <li
      className="type-ahead-hint"
      tabIndex={0}
      key={suggestion}
      onKeyDown={(e) => onLiKeyDown(e, suggestion)}
      onFocus={() => showHint(suggestion)}
      onBlur={resetHint}
      onClick={selectHint}
    >
      {suggestion}
    </li>
  ));

  const clickHandler = (e: MouseEvent) => {
    if (
      e.target instanceof HTMLElement &&
      e.target.parentElement !== ulReference.current
    )
      resetInput();
  };

  useEffect(() => {
    document.addEventListener('click', clickHandler);
    return () => removeEventListener('click', clickHandler);
  }, []);

  return (
    <div className="type-ahead">
      <div className="type-ahead-input">
        <input
          name={SEARCH_TERM_PARAM}
          type="input"
          ref={props.inputReference}
          value={inputValue}
          defaultValue={props.searchString}
          key={props.searchString}
          onChange={onInputChange}
          onKeyDown={onInputKeyDown}
          placeholder={props.placeHolderText}
        />
        <input type="text" value={hintValue} tabIndex={-1} />
      </div>
      <ul className={ulClassName} ref={ulReference}>
        {suggestionItems}
      </ul>
    </div>
  );
}

// endregion TypeAheadInput
