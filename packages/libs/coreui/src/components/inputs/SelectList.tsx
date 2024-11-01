import { ReactNode, useCallback, useEffect, useState } from 'react';
import PopoverButton from '../buttons/PopoverButton/PopoverButton';
import CheckboxList, {
  CheckboxListProps,
  Item,
} from './checkboxes/CheckboxList';

export interface SelectListProps<T> extends CheckboxListProps<T> {
  children?: ReactNode;
  /** A button's content if/when no values are currently selected */
  defaultButtonDisplayContent: ReactNode;
  isDisabled?: boolean;
  /** Are contents loading? */
  isLoading?: boolean;
  /** If true, don't wait for component to close before calling `onChange`
   *  with latest selection.
   */
  instantUpdate?: boolean;
}

export default function SelectList<T>({
  name,
  items,
  value,
  onChange,
  linksPosition,
  children,
  defaultButtonDisplayContent,
  isDisabled = false,
  isLoading = false,
  instantUpdate = false,
  ...props
}: SelectListProps<T>) {
  const [selected, setSelected] = useState<SelectListProps<T>['value']>(value);
  const [buttonDisplayContent, setButtonDisplayContent] = useState<ReactNode>(
    getDisplayContent(value, items, defaultButtonDisplayContent)
  );

  const onClose = () => {
    onChange(selected);
    setButtonDisplayContent(
      getDisplayContent(selected, items, defaultButtonDisplayContent)
    );
  };

  /**
   * Keep caller up to date with any selection changes, if required by `instantUpdate`
   */
  const handleCheckboxListUpdate = useCallback(
    (newSelection: SelectListProps<T>['value']) => {
      setSelected(newSelection);
      if (instantUpdate) {
        onChange(newSelection);
      }
    },
    [instantUpdate, setSelected, onChange]
  );

  /**
   * Need to ensure that the state syncs with parent component in the event of an external
   * clearSelection button, as is the case in EDA's line plot controls
   */
  useEffect(() => {
    setSelected(value);
    if (instantUpdate) return; // we don't want the button text changing on every click
    setButtonDisplayContent(
      getDisplayContent(value, items, defaultButtonDisplayContent)
    );
  }, [value, items, defaultButtonDisplayContent]);

  const buttonLabel = (
    <span
      style={{
        maxWidth: '300px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
    >
      {buttonDisplayContent}
    </span>
  );

  return (
    <PopoverButton
      buttonDisplayContent={buttonLabel}
      onClose={onClose}
      isDisabled={isDisabled}
    >
      <div
        css={{
          margin: '0.5em',
        }}
      >
        {isLoading && <div css={{ height: '20px' }}>Loading...</div>}
        <CheckboxList
          name={name}
          items={items}
          value={selected}
          onChange={handleCheckboxListUpdate}
          linksPosition={linksPosition}
          {...props}
        />
        {children}
      </div>
    </PopoverButton>
  );
}

// Returns button display content based on `value` array, mapping to display names from `items` when available.
// If no matching display name is found, uses the value itself. Returns `defaultContent` if `value` is empty.
function getDisplayContent<T>(
  value: T[],
  items: Item<T>[],
  defaultContent: ReactNode
): ReactNode {
  return value.length
    ? value
        .map((v) => items.find((item) => item.value === v)?.display ?? v)
        .join(', ')
    : defaultContent;
}
