import { Button, Tooltip } from '@material-ui/core';
import { CheckboxList } from '@veupathdb/wdk-client/lib/Components';
import { isEqual, sortBy } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import PopoverButton from '@veupathdb/components/lib/components/widgets/PopoverButton';

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
  const [currentlySelected, setCurrentlySelected] = useState<string[]>(
    selectedValues
  );
  // keep currentlySelected synced with external changes in selectedValues
  useEffect(() => setCurrentlySelected(selectedValues), [selectedValues]);

  const items = useMemo(
    () =>
      allowedValues.map((value) => ({
        display: <span>{value}</span>,
        value,
      })),
    [allowedValues]
  );

  const isModified = useMemo(
    () => !isEqual(sortBy(currentlySelected), sortBy(selectedValues)),
    [currentlySelected, selectedValues]
  );

  // we need to watch for changes in selectedValues, even when
  // referentially unequal but content-wise the same
  // (e.g. when pressing 'cancel')
  const [selectedValuesSerialNumber, setSelectedValuesSerialNumber] = useState(
    1
  );
  useEffect(() => {
    console.log(selectedValues);
    setSelectedValuesSerialNumber((prev) => prev + 1);
  }, [selectedValues]);

  const label = (
    <span style={{ ...(isModified ? { color: '#ccc' } : {}) }}>
      {selectedValues.length > 0
        ? selectedValues.join(', ')
        : 'Choose value(s)'}
    </span>
  );

  return (
    <Tooltip
      title={isModified ? 'This item has unsaved changes' : ''}
      placement="top"
      arrow={true}
    >
      <div>
        <PopoverButton key={selectedValuesSerialNumber} label={label}>
          <div style={{ padding: '.75em 0.25em 0.25em' }}>
            <CheckboxList
              items={items}
              value={currentlySelected}
              onChange={setCurrentlySelected}
            />
          </div>
          <div style={{ textAlign: 'center', padding: '.75em 0.25em 0.25em' }}>
            <Button
              type="button"
              style={{ width: '40%', margin: '5px' }}
              variant="outlined"
              color="default"
              size="small"
              onClick={() => {
                setCurrentlySelected(selectedValues);
                onSelectedValuesChange([...selectedValues]);
                /* spread to make intentionally referentially unequal to trigger update of selectedValuesSerialNumber */
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              style={{ width: '40%', margin: '5px' }}
              variant="contained"
              color="default"
              size="small"
              onClick={() => onSelectedValuesChange(currentlySelected)}
              disabled={!isModified}
            >
              Save
            </Button>
          </div>
        </PopoverButton>
      </div>
    </Tooltip>
  );
}
