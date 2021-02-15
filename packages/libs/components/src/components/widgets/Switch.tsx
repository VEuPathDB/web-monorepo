import React, { useState } from 'react';
import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import { Typography } from '@material-ui/core';
import MaterialSwitch from '@material-ui/core/Switch';

import { DARK_GRAY, LIGHT_BLUE, MEDIUM_GRAY } from '../../constants/colors';

export type SwitchProps = {
  /** If the switch is on or off. */
  state: boolean;
  /** What action to take when state changes. */
  // Probably don't want it this vague.
  onStateChange: (event: object) => void;
  /** Color to use. Will accept any valid CSS color definition.
   * Defaults to LIGHT_BLUE */
  color?: string;
  /** Additional styles to apply to the widget container. */
  containerStyles?: React.CSSProperties;
};

/** A simple switch UI widget.
 *
 * Should be used when you want to toggle something between two distinct options. */
export default function Switch({
  state,
  onStateChange,
  color = LIGHT_BLUE,
  containerStyles = {},
}: SwitchProps) {
  const [focused, setFocused] = useState(false);

  const theme = createMuiTheme({
    palette: {
      primary: {
        main: color,
      },
    },
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        ...containerStyles,
      }}
      onMouseOver={() => setFocused(true)}
      onMouseOut={() => setFocused(false)}
    >
      <Typography
        variant="button"
        style={{ color: focused ? DARK_GRAY : MEDIUM_GRAY, paddingRight: 15 }}
      >
        Legend
      </Typography>
      <ThemeProvider theme={theme}>
        <MaterialSwitch
          checked={state}
          onChange={onStateChange}
          size="small"
          color="primary"
        />
      </ThemeProvider>
    </div>
  );
}
