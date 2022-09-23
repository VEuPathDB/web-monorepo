import { useMemo } from 'react';
import SelectList from '@veupathdb/coreui/dist/components/inputs/SelectList';

export type ValuePickerProps = {
  allowedValues?: string[];
  selectedValues?: string[];
  /** Change communicated when [Save] button is clicked. */
  onSelectedValuesChange: (newValues: string[]) => void;
};

const EMPTY_ARRAY: string[] = [];

export function ValuePicker({
  allowedValues = EMPTY_ARRAY,
  selectedValues = EMPTY_ARRAY,
  onSelectedValuesChange,
}: ValuePickerProps) {
  const items = useMemo(
    () =>
      allowedValues.map((value) => ({
        display: <span>{value}</span>,
        value,
      })),
    [allowedValues]
  );

  return (
    <SelectList
      defaultButtonDisplayContent={'Select value(s)'}
      items={items}
      onChange={onSelectedValuesChange}
      value={selectedValues}
    />
  );
}
