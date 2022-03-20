import { Button } from '@material-ui/core';
import { DataGrid } from '@veupathdb/coreui';
import { useCallback, useMemo, useState } from 'react';
import { Row } from 'react-table';

export type ValuePickerProps = {
  allowedValues: string[];
  selectedValues: string[];
  /** Change communicated when <DONE> button clicked. */
  onSelectedValuesChange: (newValues: string[]) => void;
};

export function ValuePicker({
  allowedValues,
  selectedValues,
  onSelectedValuesChange,
}: ValuePickerProps) {
  const [currentlySelected, setCurrentlySelected] = useState<string[]>(
    selectedValues
  );

  const data = useMemo(
    () =>
      allowedValues.map((value) => ({
        value,
        isSelected: selectedValues.includes(value),
      })),
    [allowedValues, selectedValues]
  );

  // might not need the useMemo
  const columns = useMemo(() => [{ Header: 'Value', accessor: 'value' }], []);

  const onRowSelection = useCallback(
    (rows: Row<object>[]) => {
      const newValues = rows.map(({ values: { value } }) => value);
      setCurrentlySelected(newValues);
    },
    [setCurrentlySelected]
  );

  return (
    <>
      <DataGrid data={data} columns={columns} onRowSelection={onRowSelection} />
      <div style={{ textAlign: 'center', padding: '.75em 0.25em 0.25em' }}>
        <Button
          type="button"
          style={{ width: '90%', marginBottom: '5px' }}
          variant="contained"
          color="default"
          size="small"
          onClick={() => onSelectedValuesChange(currentlySelected)}
        >
          Confirm
        </Button>
      </div>
    </>
  );
}
