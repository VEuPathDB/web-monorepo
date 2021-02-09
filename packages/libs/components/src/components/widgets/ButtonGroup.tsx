import React, { useState } from 'react';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import { DARK_GRAY, MEDIUM_GRAY } from '../../constants/colors';
import { Typography } from '@material-ui/core';

export type ButtonGroupProps = {
  /** Label for the widget. Optional. */
  label?: string;
  /** How buttons are displayed. Vertical or Horizontal */
  orientation?: 'vertical' | 'horizontal';
  /** Options that will be presented as buttons. */
  options: Array<string>;
  /** The currently selected option.  */
  selectedOption: string;
  /** Action to take when an option is selected by the user. */
  onOptionSelected: (option: string) => void;
  /** Additional widget container styles. Optional. */
  containerStyles?: React.CSSProperties;
};

/**
 * A simple group of buttons in which only a single
 * button can be selected at any given time.
 */
export default function ButtonGroup({
  label = undefined,
  orientation = 'horizontal',
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
          variant="button"
          style={{ color: focused ? DARK_GRAY : MEDIUM_GRAY }}
        >
          {label}
        </Typography>
      )}
      <ToggleButtonGroup
        value={selectedOption}
        orientation={orientation}
        exclusive
        onChange={(event, value) => value && onOptionSelected(value)}
        aria-label={`${label} control button group`}
      >
        {options.map((option, index) => (
          <ToggleButton
            key={index}
            value={option}
            aria-label={option}
            style={{
              padding: 5,
              paddingLeft: 7.5,
              paddingRight: 7.5,
              fontSize: '12px',
              fontWeight: 400,
              textTransform: 'capitalize',
              justifyContent: 'start',
            }}
          >
            {option}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </div>
  );
}
