import React, { useState, useEffect } from 'react';

import { Typography } from '@material-ui/core';
import { DARK_GRAY, MEDIUM_GRAY } from '../../constants/colors';
import NumericInput from './NumericInput';
import { NumericRange } from '../../types/general';

export type NumericRangeInputProps = {
  /** Default value for the range. */
  defaultRange: NumericRange;
  /** Minimum and maximum allowed values for the user-inputted range. Optional. */
  rangeBounds?: NumericRange;
  /** Externally controlled range. Optional but recommended. */
  controlledRange?: NumericRange;
  /** Function to invoke when range changes. */
  onRangeChange?: (newRange: NumericRange) => void;
  /** UI Label for the widget. Optional */
  label?: string;
  /** Label for lower bound widget. Optional. Default is Min */
  lowerLabel?: string;
  /** Label for upper bound widget. Optional. Default is Max */
  upperLabel?: string;
  /** Additional styles for component container. Optional. */
  containerStyles?: React.CSSProperties;
};

export default function NumericRangeInput({
  defaultRange,
  rangeBounds,
  controlledRange,
  onRangeChange,
  label,
  lowerLabel = 'Min',
  upperLabel = 'Max',
  containerStyles,
}: NumericRangeInputProps) {
  // lower and upper ranges for internal/uncontrolled operation
  const [lower, setLowerValue] = useState<number>(defaultRange.min);
  const [upper, setUpperValue] = useState<number>(defaultRange.max);

  const [focused, setFocused] = useState(false);

  // listen for changes to the values of the two NumericInputs
  // and communicate outwards via onRangeChange
  useEffect(() => {
    if (onRangeChange && lower !== undefined && upper !== undefined) {
      onRangeChange({ min: lower, max: upper });
    }
  }, [lower, upper]);

  // listen for changes to the controlledRange min and max (if provided)
  // and communicate those inwards to lower and upper
  useEffect(() => {
    if (controlledRange !== undefined) setLowerValue(controlledRange.min);
  }, [controlledRange?.min]);

  useEffect(() => {
    if (controlledRange !== undefined) setUpperValue(controlledRange.max);
  }, [controlledRange?.max]);

  return (
    <div
      style={{ ...containerStyles }}
      onMouseOver={() => setFocused(true)}
      onMouseOut={() => setFocused(false)}
    >
      {label && (
        <Typography
          variant="button"
          style={{ color: focused ? DARK_GRAY : MEDIUM_GRAY }}
        >
          {label}
        </Typography>
      )}
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <NumericInput
          controlledValue={lower}
          minValue={rangeBounds?.min}
          maxValue={upper ?? rangeBounds?.max}
          label={lowerLabel}
          onValueChange={(newValue) => {
            if (newValue !== undefined) setLowerValue(newValue);
          }}
          containerStyles={{ margin: 25 }}
        />
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <div style={{ margin: 25 }}>
            <Typography
              variant="button"
              style={{ color: focused ? DARK_GRAY : MEDIUM_GRAY }}
            >
              to
            </Typography>
          </div>
        </div>
        <NumericInput
          controlledValue={upper}
          minValue={lower ?? rangeBounds?.min}
          maxValue={rangeBounds?.max}
          label={upperLabel}
          onValueChange={(newValue) => {
            if (newValue !== undefined) setUpperValue(newValue);
          }}
          containerStyles={{ margin: 25 }}
        />
      </div>
    </div>
  );
}
