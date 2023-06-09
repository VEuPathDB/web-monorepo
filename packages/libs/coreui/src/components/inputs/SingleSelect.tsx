import { ReactNode, useEffect, useState, useRef } from 'react';
import PopoverButton from '../buttons/PopoverButton/PopoverButton';
import { Item } from './checkboxes/CheckboxList';
import { css } from '@emotion/react';
import { uniqueId } from 'lodash';
import { CheckIcon } from '../icons';

export interface SingleSelectProps<T> {
  /** An array of options to be used in the dropdown container */
  items: Item<T>[];

  /**
   * Warning: `value` represents the currently-selected value; for non-primitive types, `value` must be
   * pointing to the same object reference as what's used in the `items` prop
   */
  value: T;

  onSelect: (value: T) => void;
  buttonDisplayContent: ReactNode;
  isDisabled?: boolean;
}

const checkIconContainer = { height: 16, width: 16 };

export default function SingleSelect<T>({
  items,
  value,
  onSelect,
  buttonDisplayContent,
  isDisabled = false,
}: SingleSelectProps<T>) {
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);

  /**
   * 1. Find the index of the value prop in the items array to set focused state in the dropdown
   * 2. If a value is not found, defaults to the first item in the dropdown
   */
  const selectedValueIndex = items.findIndex((item) => value === item.value);
  const defaultOrSelectedValueIndex =
    selectedValueIndex !== -1 ? selectedValueIndex : 0;
  const [indexOfFocusedElement, setIndexOfFocusedElement] = useState(
    defaultOrSelectedValueIndex
  );

  const [key, setKey] = useState<string>('');

  const handleSelection = (newValue: T) => {
    onSelect(newValue);
    setKey(uniqueId());
  };

  /** Update focused element when index of selected value changes */
  useEffect(() => {
    setIndexOfFocusedElement(defaultOrSelectedValueIndex);
  }, [defaultOrSelectedValueIndex]);

  const onKeyDown = (key: string, newValue: T) => {
    if (!isPopoverOpen) return;

    if (key === 'Enter') {
      handleSelection(newValue);
    }

    const hasNextUpIndex = indexOfFocusedElement !== 0;
    if (key === 'ArrowUp' && hasNextUpIndex) {
      setIndexOfFocusedElement((prev) => prev - 1);
    }

    const hasNextDownIndex = indexOfFocusedElement !== items.length - 1;
    if (key === 'ArrowDown' && hasNextDownIndex) {
      setIndexOfFocusedElement((prev) => prev + 1);
    }
  };

  return (
    <PopoverButton
      key={key}
      buttonDisplayContent={buttonDisplayContent}
      setIsPopoverOpen={setIsPopoverOpen}
      isDisabled={isDisabled}
    >
      <ul
        aria-label={'Menu of selectable options'}
        role="listbox"
        css={{
          padding: '0.125em',
          margin: 0,
          minWidth: '200px',
          listStyle: 'none',
        }}
      >
        {items.map((item, index) => (
          <Option<T>
            key={JSON.stringify(item.value)}
            item={item}
            onSelect={handleSelection}
            onKeyDown={onKeyDown}
            shouldFocus={index === indexOfFocusedElement}
            isSelected={value === item.value}
          />
        ))}
      </ul>
    </PopoverButton>
  );
}

interface OptionProps<T> {
  item: Item<T>;
  onSelect: (value: T) => void;
  onKeyDown: (key: string, value: T) => void;
  shouldFocus: boolean;
  isSelected: boolean;
}

function Option<T>({
  item,
  onSelect,
  onKeyDown,
  shouldFocus,
  isSelected,
}: OptionProps<T>) {
  const optionRef = useRef<HTMLLIElement>(null);

  if (shouldFocus && optionRef.current) {
    optionRef.current.focus();
  }

  return (
    <li
      role="option"
      aria-selected={isSelected}
      ref={optionRef}
      css={css`
        display: flex;
        align-items: center;
        gap: 0.25em;
        padding: 0.5em;
        line-height: 1.25;
        cursor: pointer;
        &:focus {
          outline: thin dotted;
        }
        &:hover {
          background-color: #3375e1;
          color: white;
          fill: white;
        }
      `}
      tabIndex={-1}
      onClick={() => onSelect(item.value)}
      onKeyDown={(e) => onKeyDown(e.key, item.value)}
    >
      <span css={checkIconContainer}>
        {isSelected ? <CheckIcon /> : undefined}
      </span>
      {item.display}
    </li>
  );
}
