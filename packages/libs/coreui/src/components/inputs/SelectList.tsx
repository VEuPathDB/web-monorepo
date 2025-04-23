import { ReactNode, useCallback, useEffect, useState } from 'react';
import PopoverButton from '../buttons/PopoverButton/PopoverButton';
import CheckboxList, {
  CheckboxListProps,
  Item,
} from './checkboxes/CheckboxList';

export interface SelectListProps<T extends string>
  extends CheckboxListProps<T> {
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
  /** Optional. When true, popover closing will be deferred until this becomes false */
  deferPopoverClosing?: boolean;
}

export default function SelectList<T extends string>({
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
  deferPopoverClosing = false,
  ...props
}: SelectListProps<T>) {
  const [selected, setSelected] = useState<SelectListProps<T>['value']>(value);
  const [buttonDisplayContent, setButtonDisplayContent] = useState<ReactNode>(
    getDisplayContent(value, items, defaultButtonDisplayContent)
  );
  const [isOpen, setIsOpen] = useState(false);

  const onClose = useCallback(() => {
    if (!instantUpdate) onChange(selected);
    setButtonDisplayContent(
      getDisplayContent(selected, items, defaultButtonDisplayContent)
    );
  }, [instantUpdate, selected, items, defaultButtonDisplayContent, onChange]);

  /**
   * Keep caller up to date with any selection changes, if required by `instantUpdate`
   */
  const handleCheckboxListUpdate = useCallback(
    (newSelection: SelectListProps<T>['value']) => {
      // only allow updates while open
      // seems obvious, but animated transitions blur the lines
      if (!isOpen) return;
      setSelected(newSelection);
      if (instantUpdate) {
        onChange(newSelection);
      }
    },
    [instantUpdate, onChange, isOpen]
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
      setIsPopoverOpen={setIsOpen}
      deferClosing={deferPopoverClosing}
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

// Returns button display content based on `value` array, mapping to altDisplay, display, or value from `items` in that order of preference.
// If no matching display name is found, uses the value itself. Returns `defaultContent` if `value` is empty.
function getDisplayContent<T extends string>(
  value: T[],
  items: Item<T>[],
  defaultContent: ReactNode
): ReactNode {
  return value.length
    ? value
        .map<ReactNode>((v) => {
          const item = items.find((item) => item.value === v);
          return item?.altDisplay ?? item?.display ?? v;
        })
        .reduce((accum, elem) => (accum ? [accum, ',', elem] : elem), null)
    : defaultContent;
}
