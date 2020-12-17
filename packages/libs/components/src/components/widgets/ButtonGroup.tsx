import React, { useState } from 'react';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import { DARK_GRAY, MEDIUM_GRAY } from '../../constants/colors';
import { Typography } from '@material-ui/core';

export type ButtonGroupProps = {
  /** Label for the widget. Optional. */
  label?: string;
  /** Options that will be presented as buttons. */
  options: Array<string>;
  /** The currently selected option.  */
  selectedOption: string;
  /** Action to take when an option is selected by the user. */
  onOptionSelected: (option: string) => void;
  /** Additional widget container styles. Optional. */
  containerStyles?: React.CSSProperties;
};

export default function ButtonGroup({
  label = undefined,
  options,
  selectedOption,
  onOptionSelected,
  containerStyles = {},
}: ButtonGroupProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        ...containerStyles,
      }}
      onMouseOver={() => setFocused(true)}
      onMouseOut={() => setFocused(false)}
    >
      {label && (
        <Typography
          variant='button'
          style={{ color: focused ? DARK_GRAY : MEDIUM_GRAY }}
        >
          {label}
        </Typography>
      )}
      <ToggleButtonGroup
        value={selectedOption}
        exclusive
        onChange={(event, value) => value && onOptionSelected(value)}
        aria-label={`${label} control button group`}
      >
        {options.map((option) => (
          <ToggleButton
            value={option}
            aria-label={option}
            style={{
              padding: '5px',
              fontSize: '12px',
              fontWeight: 400,
              textTransform: 'capitalize',
            }}
          >
            {option}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </div>
  );
}
