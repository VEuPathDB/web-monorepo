import { merge } from 'lodash';
import { useMemo } from 'react';

import useUITheme from '../../theming/useUITheme';
import { blue } from '../../../definitions/colors';
import SwissArmyButton, { SwissArmyButtonProps } from '../SwissArmyButton';
import { ButtonStyleSpec } from '..';

export type OutlinedButtonProps = Omit<SwissArmyButtonProps, 'stylePreset'> & {
  styleOverrides: Partial<ButtonStyleSpec>;
};

/** Basic button with a variety of customization options. */
export default function OutlinedButton({
  text,
  onPress,
  tooltip,
  size = 'medium',
  icon = () => null,
  role,
  styleOverrides = {},
}: OutlinedButtonProps) {
  const defaultStyle: ButtonStyleSpec = {
    default: {
      textColor: blue[500],
      color: 'transparent',
      border: {
        radius: 5,
        color: blue[500],
        style: 'solid',
        width: 2,
      },
    },
    hover: {
      textColor: blue[600],
      color: 'transparent',
      border: {
        radius: 5,
        color: blue[600],
        style: 'solid',
        width: 2,
      },
    },
    pressed: {
      textColor: blue[700],
      color: 'transparent',
      border: {
        radius: 5,
        color: blue[700],
        style: 'solid',
        width: 2,
      },
    },
  };

  const theme = useUITheme();
  const themeStyle = useMemo<Partial<ButtonStyleSpec>>(
    () =>
      theme && role
        ? {
            default: {
              textColor: theme.palette[role].hue[theme.palette[role].level],
              border: {
                color: theme.palette[role].hue[theme.palette[role].level],
              },
            },
            hover: {
              textColor:
                theme.palette[role].hue[theme.palette[role].level + 100],
              border: {
                color: theme.palette[role].hue[theme.palette[role].level + 100],
              },
            },
            pressed: {
              textColor:
                theme.palette[role].hue[theme.palette[role].level + 200],
              border: {
                color: theme.palette[role].hue[theme.palette[role].level + 200],
              },
            },
          }
        : {},
    [theme, role]
  );

  const finalStyle = useMemo(
    () => merge({}, defaultStyle, themeStyle, styleOverrides),
    [themeStyle]
  );

  return (
    <SwissArmyButton
      style={finalStyle}
      text={text}
      onPress={onPress}
      tooltip={tooltip}
      size={size}
      icon={icon}
      role={role}
    />
  );
}
