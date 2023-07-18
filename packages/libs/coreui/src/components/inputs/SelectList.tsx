import { ReactNode, useEffect, useState } from 'react';
import PopoverButton from '../buttons/PopoverButton/PopoverButton';
import CheckboxList, { CheckboxListProps } from './checkboxes/CheckboxList';

export interface SelectListProps<T> extends CheckboxListProps<T> {
  children?: ReactNode;
  /** A button's content if/when no values are currently selected */
  defaultButtonDisplayContent: ReactNode;
  isDisabled?: boolean;
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
}: SelectListProps<T>) {
  const [selected, setSelected] = useState<SelectListProps<T>['value']>(value);
  const [buttonDisplayContent, setButtonDisplayContent] = useState<ReactNode>(
    value.length ? value.join(', ') : defaultButtonDisplayContent
  );

  const onClose = () => {
    onChange(selected);
    setButtonDisplayContent(
      selected.length ? selected.join(', ') : defaultButtonDisplayContent
    );
  };

  /**
   * Need to ensure that the state syncs with parent component in the event of an external
   * clearSelection button, as is the case in EDA's line plot controls
   */
  useEffect(() => {
    setSelected(value);
    setButtonDisplayContent(
      value.length ? value.join(', ') : defaultButtonDisplayContent
    );
  }, [value, defaultButtonDisplayContent]);

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
        <CheckboxList
          name={name}
          items={items}
          value={selected}
          onChange={setSelected}
          linksPosition={linksPosition}
        />
        {children}
      </div>
    </PopoverButton>
  );
}
