import React, { useEffect, useRef, useState } from 'react';

import './SiteSearch.scss';
import { SEARCH_TERM_PARAM } from './SiteSearchConstants';

// region Keyboard

const kbHasModifier = (e: React.KeyboardEvent<any>) =>
  e.altKey || e.metaKey || e.ctrlKey || e.shiftKey;
const kbHasOnlyShiftMod = (e: React.KeyboardEvent<any>) =>
  !(e.altKey || e.metaKey || e.ctrlKey) && e.shiftKey;
const kbIsTab = (e: React.KeyboardEvent<any>) =>
  e.code === 'Tab' || e.keyCode == 9;
const kbIsSpace = (e: React.KeyboardEvent<any>) =>
  e.code === 'Space' || e.keyCode == 32;
const kbIsArrowRight = (e: React.KeyboardEvent<any>) =>
  e.code === 'ArrowRight' || e.keyCode == 39;
const kbIsArrowDown = (e: React.KeyboardEvent<any>) =>
  e.code === 'ArrowDown' || e.keyCode == 40;
const kbIsArrowUp = (e: React.KeyboardEvent<any>) =>
  e.code === 'ArrowUp' || e.keyCode == 38;
const kbIsEnter = (e: React.KeyboardEvent<any>) =>
  e.code === 'Enter' || e.keyCode == 13;
const kbIsEscape = (e: React.KeyboardEvent<any>) =>
  e.code === 'Escape' || e.keyCode == 27;

// endregion Keyboard

// region Strings

const lastWordOf = (value: string) =>
  ((arr: Array<string>) => (arr.length > 0 ? arr[arr.length - 1] : ''))(
    value.split(/ +/)
  );

const replaceLastWord = (original: string, replacement: string) =>
  original.substring(0, original.lastIndexOf(lastWordOf(original))) +
  replacement;

// endregion Strings

// region Debouncer

type Debouncer<T> = (func: (value: T) => void) => (value: T) => void;

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

class TypeAheadAPI {
  private apiEndpoint: string;

  constructor(endpoint: string) {
    this.apiEndpoint =
      (endpoint.endsWith('/') ? endpoint : endpoint + '/') + TYPEAHEAD_PATH;
  }

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

    for (const entry in json as Array<any>) {
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

  const typeAheadAPI = new TypeAheadAPI(
    'https://161a-2600-4040-70fa-ee00-a236-2c1e-6c12-f4c9.ngrok-free.app' /*props.siteSearchURL*/
  );
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
