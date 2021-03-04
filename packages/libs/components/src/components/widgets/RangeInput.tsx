import React, { useState, useEffect } from 'react';

import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { DARK_GRAY, MEDIUM_GRAY } from '../../constants/colors';
import NumericInput from './NumericInput';
import { Range } from '../../types/general';

export type RangeInputProps = {
  /** Default value for lower end of range. Optional. */
  defaultLower?: number;
  /** Default value for upper end of range. Optional. */
  defaultUpper?: number;
  /** Minimum allowed value for lower bound. Optional. */
  minLower?: number;
  /** Maximum allowed value for upper bound. Optional. */
  maxUpper?: number;
  /** Function to invoke when range changes. */
  onRangeChange: (newRange: Range) => void;
  /** UI Label for the widget. Optional */
  label?: string;
  /** Label for lower bound widget. Optional. Default is Min */
  lowerLabel?: string;
  /** Label for upper bound widget. Optional. Default is Max */
  upperLabel?: string;
  /** Additional styles for component container. Optional. */
  containerStyles?: React.CSSProperties;
};

export default function RangeInput({
  defaultLower,
  defaultUpper,
  minLower,
  maxUpper,
  onRangeChange,
  label,
  lowerLabel = 'Min',
  upperLabel = 'Max',
  containerStyles,
}: RangeInputProps) {
  const [lower, setLowerValue] = useState<number | undefined>(defaultLower);
  const [upper, setUpperValue] = useState<number | undefined>(defaultUpper);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (lower !== undefined && upper !== undefined) {
      onRangeChange({ min: lower, max: upper });
    }
  }, [lower, upper, onRangeChange]);

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
            setLowerValue(newValue);
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
            setUpperValue(newValue);
          }}
          containerStyles={{ margin: 25 }}
        />
      </div>
    </div>
  );
}
