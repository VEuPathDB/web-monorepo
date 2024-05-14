import SelectList from '@veupathdb/coreui/lib/components/inputs/SelectList';
import { ReactNode } from 'react';
import { ClearSelectionButton } from '../../variableSelectors/VariableTreeDropdown';
import { SearchBox } from '@veupathdb/coreui';

export type ValuePickerProps = {
  allowedValues?: string[];
  selectedValues?: string[];
  disabledValues?: string[];
  /** Change communicated when [Save] button is clicked. */
  onSelectedValuesChange: (newValues: string[]) => void;
  disabledCheckboxTooltipContent?: ReactNode;
  disableInput?: boolean;
  showClearSelectionButton?: boolean;
  /** Show loading spinner */
  isLoading?: boolean;
  /** Show a searchbox? */
  isSearchable?: boolean;
};

const EMPTY_ALLOWED_VALUES_ARRAY: string[] = [];
const EMPTY_SELECTED_VALUES_ARRAY: string[] = [];
const EMPTY_DISABLED_VALUES_ARRAY: string[] = [];

export function ValuePicker({
  allowedValues = EMPTY_ALLOWED_VALUES_ARRAY,
  selectedValues = EMPTY_SELECTED_VALUES_ARRAY,
  disabledValues = EMPTY_DISABLED_VALUES_ARRAY,
  onSelectedValuesChange,
  disabledCheckboxTooltipContent,
  disableInput = false,
  showClearSelectionButton = true,
  isLoading = false,
  isSearchable = false,
}: ValuePickerProps) {
  const items = allowedValues.map((value) => ({
    display: <span>{value}</span>,
    value,
    disabled: disabledValues.includes(value),
  }));

  return (
    <>
      {isSearchable && <SearchBox />}
      <SelectList
        defaultButtonDisplayContent={'Select value(s)'}
        items={items}
        onChange={onSelectedValuesChange}
        value={selectedValues}
        disabledCheckboxTooltipContent={disabledCheckboxTooltipContent}
        isDisabled={disableInput}
        isLoading={isLoading}
      />
      {showClearSelectionButton && (
        <ClearSelectionButton
          onClick={() => onSelectedValuesChange([])}
          disabled={!selectedValues.length}
          style={{ marginLeft: '0.5em' }}
        />
      )}
    </>
  );
}
