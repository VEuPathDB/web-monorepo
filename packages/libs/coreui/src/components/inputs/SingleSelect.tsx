import { ReactNode, useEffect, useState, useRef } from 'react';
import PopoverButton from '../buttons/PopoverButton/PopoverButton';
import { Item } from './checkboxes/CheckboxList';
import { css } from '@emotion/react';
import { uniqueId } from 'lodash';
import { CheckIcon } from '../icons';
import { PartialButtonStyleSpec } from '../buttons';

export interface ItemGroup<T> {
  label: ReactNode;
  items: Item<T>[];
}

export interface SingleSelectProps<T> {
  /** An array of options to be used in the dropdown container */
  items: (Item<T> | ItemGroup<T>)[];

  /**
   * Warning: `value` represents the currently-selected value; for non-primitive types, `value` must be
   * pointing to the same object reference as what's used in the `items` prop
   */
  value: T;

  onSelect: (value: T) => void;
  buttonDisplayContent: ReactNode;
  isDisabled?: boolean;
  styleOverrides?: PartialButtonStyleSpec;
}

const checkIconContainer = { height: 16, width: 16 };

export default function SingleSelect<T>({
  items,
  value,
  onSelect,
  buttonDisplayContent,
  isDisabled = false,
  styleOverrides,
}: SingleSelectProps<T>) {
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);

  /**
   * 1. Find the index of the value prop in the items array to set focused state in the dropdown
   * 2. If a value is not found, defaults to the first item in the dropdown
   */
  const flatItems = items.flatMap((item) =>
    'label' in item ? item.items : [item]
  );
  const selectedValueIndex = flatItems.findIndex(
    (item) => value === item.value
  );
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

    const hasNextDownIndex = indexOfFocusedElement !== flatItems.length - 1;
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
      styleOverrides={styleOverrides}
    >
      <ul
        aria-label={'Menu of selectable options'}
        role="listbox"
        css={{
          padding: '0.125em',
          margin: 0,
          minWidth: '200px',
          listStyle: 'none',
          position: 'relative',
        }}
      >
        {
          items.reduce(
            ({ items, aggregateIndex }, item) => ({
              items: [
                ...items,
                'label' in item ? (
                  <OptionGroup
                    key={aggregateIndex}
                    itemGroup={item}
                    onSelect={handleSelection}
                    onKeyDown={onKeyDown}
                    value={value}
                    indexOfFocusedElement={indexOfFocusedElement}
                    indexOffset={aggregateIndex}
                  />
                ) : (
                  <Option<T>
                    key={aggregateIndex}
                    item={item}
                    onSelect={handleSelection}
                    onKeyDown={onKeyDown}
                    shouldFocus={aggregateIndex === indexOfFocusedElement}
                    isSelected={value === item.value}
                    isDisabled={!!item.disabled}
                  />
                ),
              ],
              aggregateIndex:
                aggregateIndex + ('label' in item ? item.items.length : 1),
            }),
            { items: [] as ReactNode[], aggregateIndex: 0 }
          ).items
        }
      </ul>
    </PopoverButton>
  );
}

interface OptionGroupProps<T> {
  itemGroup: ItemGroup<T>;
  onSelect: (value: T) => void;
  onKeyDown: (key: string, value: T) => void;
  value: T;
  indexOffset: number;
  indexOfFocusedElement: number;
}
function OptionGroup<T>(props: OptionGroupProps<T>) {
  const {
    itemGroup,
    onKeyDown,
    onSelect,
    value,
    indexOffset,
    indexOfFocusedElement,
  } = props;
  return (
    <ul
      css={{
        padding: '0.125em',
        margin: 0,
        minWidth: '200px',
        listStyle: 'none',
      }}
    >
      <li>
        <div
          css={{
            padding: '0.5em',
            position: 'sticky',
            top: 0,
            marginBottom: '1px',
            background: 'white',
          }}
        >
          <strong>{itemGroup.label}</strong>
        </div>
        {itemGroup.items.map((item, index) => {
          return (
            <Option
              key={JSON.stringify(item.value)}
              item={item}
              onSelect={onSelect}
              onKeyDown={onKeyDown}
              shouldFocus={indexOfFocusedElement === index + indexOffset}
              isSelected={value === item.value}
            />
          );
        })}
      </li>
    </ul>
  );
}

interface OptionProps<T> {
  item: Item<T>;
  onSelect: (value: T) => void;
  onKeyDown: (key: string, value: T) => void;
  shouldFocus: boolean;
  isSelected: boolean;
  isDisabled?: boolean;
}

export function Option<T>({
  item,
  onSelect,
  onKeyDown,
  shouldFocus,
  isSelected,
  isDisabled = false,
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
        cursor: ${isDisabled ? 'not-allowed' : 'pointer'};
        opacity: ${isDisabled ? 0.5 : 1};
        scroll-margin-top: 2em;
        &:focus {
          outline: none;
          background-color: ${isDisabled ? 'inherit' : '#f3f3f3'};
        }
        &:hover {
          background-color: ${isDisabled ? 'inherit' : '#3375e1'};
          color: ${isDisabled ? 'inherit' : 'white'};
          fill: ${isDisabled ? 'inherit' : 'white'};
        }
      `}
      tabIndex={-1}
      onClick={() => {
        if (!isDisabled) {
          onSelect(item.value);
        }
      }}
      onKeyDown={(e) => {
        e.preventDefault();
        if (!isDisabled) {
          onKeyDown(e.key, item.value);
        }
      }}
    >
      <span css={checkIconContainer}>
        {isSelected ? <CheckIcon /> : undefined}
      </span>
      {item.display}
    </li>
  );
}
