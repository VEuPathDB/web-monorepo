import React, { useState } from 'react';
import FormatAlignLeftIcon from '@material-ui/icons/FormatAlignLeft';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import { DARK_GRAY, MEDIUM_GRAY } from '../../constants/colors';
import { Typography } from '@material-ui/core';

export type OrientationToggleProps = {
  /** Which orientation is currently selected. */
  orientation: 'vertical' | 'horizontal';
  /** What action to take when orientation changes. */
  onOrientationChange: (newOrientation: 'vertical' | 'horizontal') => void;
  /** Additional styles to apply to the widget container. */
  containerStyles?: React.CSSProperties;
};

/**
 * A simple UI widget for toggling plot orientation.
 */
export default function OrientationToggle({
  orientation,
  onOrientationChange,
  containerStyles = {},
}: OrientationToggleProps) {
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
      <Typography
        variant="button"
        style={{ color: focused ? DARK_GRAY : MEDIUM_GRAY }}
      >
        Orientation
      </Typography>
      <ToggleButtonGroup
        value={orientation}
        exclusive
        onChange={(event, value) => onOrientationChange(value)}
        aria-label="Plot Orientation Control"
      >
        <ToggleButton
          value="vertical"
          aria-label="vertical"
          style={{ padding: '5px' }}
        >
          <FormatAlignLeftIcon
            style={{ transform: 'rotate(-90deg)', fontSize: '18px' }}
          />
        </ToggleButton>
        <ToggleButton
          value="horizontal"
          aria-label="horizontal"
          style={{ padding: '5px' }}
        >
          <FormatAlignLeftIcon style={{ fontSize: '18px' }} />
        </ToggleButton>
      </ToggleButtonGroup>
    </div>
  );
}
