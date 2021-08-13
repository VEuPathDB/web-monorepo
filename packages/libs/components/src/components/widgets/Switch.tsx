import React, { useState } from 'react';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import MaterialSwitch from '@material-ui/core/Switch';

import { DARK_GRAY, LIGHT_BLUE, MEDIUM_GRAY } from '../../constants/colors';

export type SwitchProps = {
  /** Optional label for widget. */
  label?: string;
  /** If the switch is on or off. */
  state?: boolean;
  /** What action to take when state changes. */
  onStateChange: (newState: boolean) => void;
  /** Color to use. Will accept any valid CSS color definition.
   * Defaults to LIGHT_BLUE */
  color?: string;
  /** Additional styles to apply to the widget container. */
  containerStyles?: React.CSSProperties;
  /** If true, disable interaction with the switch */
  disabled?: boolean;
};

/**
 * A simple switch UI widget.
 *
 * Should be used when you want to toggle something
 * between two distinct options. */
export default function Switch({
  label,
  state,
  onStateChange,
  color = LIGHT_BLUE,
  containerStyles = {},
  disabled = false,
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
      onMouseOver={() => setFocused(true && !disabled)}
      onMouseOut={() => setFocused(false)}
    >
      {label && (
        <Typography
          variant="button"
          style={{ color: focused ? DARK_GRAY : MEDIUM_GRAY, paddingRight: 5 }}
        >
          {label}
        </Typography>
      )}
      <ThemeProvider theme={theme}>
        <MaterialSwitch
          checked={state}
          // The stinky use of `any` here comes from
          // an incomplete type definition in the
          // material UI library. (Comment author unknown - possibly MD)
          onChange={(event: any) => onStateChange(event.target.checked)}
          size="small"
          color="primary"
          disabled={disabled}
        />
      </ThemeProvider>
    </div>
  );
}
