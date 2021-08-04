import React from 'react';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import MaterialButton from '@material-ui/core/Button';

import { LIGHT_BLUE } from '../../constants/colors';

export type ButtonProps = {
  /** Indicates if the button should be have a colored outline and
   * transparent center or have a solid fill color. */
  type: 'outlined' | 'solid';
  /** Text of the button */
  text: string;
  /** Action to take when the button is clicked. */
  onClick: () => void;
  /** Color to use for outline/fill. Will accept any
   * valid CSS color definition. Defaults to LIGHT_BLUE */
  color?: string;
  /** Button text color. Defaults to LIGHT_BLUE if type is
   * `outlined` or white if type is `solid`. */
  textColor?: string;
  /** Additional styles to apply to the widget container. */
  containerStyles?: React.CSSProperties;
};

/** A simple button with a few customization options. */
export default function Button({
  type,
  text,
  onClick,
  color = LIGHT_BLUE,
  textColor,
  containerStyles = {},
}: ButtonProps) {
  // Override Material UI color scheme.
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
        ...containerStyles,
      }}
    >
      <ThemeProvider theme={theme}>
        <MaterialButton
          variant={type === 'outlined' ? 'outlined' : 'contained'}
          disableElevation={true}
          style={{
            width: '100%',
            color: textColor ? textColor : undefined,
          }}
          color="primary"
          onClick={onClick}
        >
          {text}
        </MaterialButton>
      </ThemeProvider>
    </div>
  );
}
