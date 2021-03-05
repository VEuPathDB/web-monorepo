import React, { useState, useEffect } from 'react';

import { Typography } from '@material-ui/core';
import { DARK_GRAY, MEDIUM_GRAY } from '../../constants/colors';
import NumericInput from './NumericInput';
import { NumericRange } from '../../types/general';

export type NumericRangeInputProps = {
  /** Default value for lower end of range. */
  defaultLower: number;
  /** Default value for upper end of range. */
  defaultUpper: number;
  /** Minimum allowed value for lower bound. Optional. */
  minLower?: number;
  /** Maximum allowed value for upper bound. Optional. */
  maxUpper?: number;
  /** Externally controlled range. Optional but recommended. */
  controlledRange?: NumericRange;
  /** Function to invoke when range changes. */
  onRangeChange: (newRange: NumericRange) => void;
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
  defaultLower,
  defaultUpper,
  minLower,
  maxUpper,
  controlledRange,
  onRangeChange,
  label,
  lowerLabel = 'Min',
  upperLabel = 'Max',
  containerStyles,
}: NumericRangeInputProps) {
  // lower and upper ranges for internal/uncontrolled operation
  const [lower, setLowerValue] = useState<number>(defaultLower);
  const [upper, setUpperValue] = useState<number>(defaultUpper);

  const [focused, setFocused] = useState(false);

  // listen for changes to the values of the two NumericInputs
  // and communicate outwards via onRangeChange
  useEffect(() => {
    if (lower !== undefined && upper !== undefined) {
      onRangeChange({ min: lower, max: upper });
    }
  }, [lower, upper, onRangeChange]);

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
          minValue={minLower}
          maxValue={upper ?? maxUpper}
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
          minValue={lower ?? minLower}
          maxValue={maxUpper}
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
