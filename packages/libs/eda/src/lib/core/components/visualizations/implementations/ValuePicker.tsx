import SelectList from '@veupathdb/coreui/lib/components/inputs/SelectList';
import { ReactNode } from 'react';
import { ClearSelectionButton } from '../../variableTrees/VariableTreeDropdown';

export type ValuePickerProps = {
  allowedValues?: string[];
  selectedValues?: string[];
  disabledValues?: string[];
  /** values that are currently selected but should be deselected; displayed with strike-through */
  disallowedValues?: string[];
  /** Change communicated when [Save] button is clicked. */
  onSelectedValuesChange: (newValues: string[]) => void;
  disabledCheckboxTooltipContent?: ReactNode;
  disableInput?: boolean;
  showClearSelectionButton?: boolean;
  /** Show loading spinner */
  isLoading?: boolean;
};

const EMPTY_ALLOWED_VALUES_ARRAY: string[] = [];
const EMPTY_SELECTED_VALUES_ARRAY: string[] = [];
const EMPTY_DISABLED_VALUES_ARRAY: string[] = [];
const EMPTY_DISALLOWED_VALUES_ARRAY: string[] = [];

export function ValuePicker({
  allowedValues = EMPTY_ALLOWED_VALUES_ARRAY,
  selectedValues = EMPTY_SELECTED_VALUES_ARRAY,
  disabledValues = EMPTY_DISABLED_VALUES_ARRAY,
  disallowedValues = EMPTY_DISALLOWED_VALUES_ARRAY,
  onSelectedValuesChange,
  disabledCheckboxTooltipContent,
  disableInput = false,
  showClearSelectionButton = true,
  isLoading = false,
}: ValuePickerProps) {
  const items = allowedValues
    .map((value) => ({
      display: <span>{value}</span>,
      value,
      disabled: disabledValues.includes(value),
    }))
    .concat(
      disallowedValues.map((value) => ({
        display: (
          <span>
            <s>{value}</s>
          </span>
        ),
        value,
        disabled: false,
      }))
    );

  // 'manual' container div styling was a short-cut
  // because it seems that SelectList's styleOverrides isn't implemented?
  return (
    <>
      <div
        style={
          disallowedValues.length
            ? {
                border: '2px solid red',
                borderRadius: '5px',
              }
            : {}
        }
      >
        <SelectList
          defaultButtonDisplayContent={'Select value(s)'}
          items={items}
          onChange={onSelectedValuesChange}
          value={selectedValues}
          disabledCheckboxTooltipContent={disabledCheckboxTooltipContent}
          isDisabled={disableInput}
          isLoading={isLoading}
        />
      </div>
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
