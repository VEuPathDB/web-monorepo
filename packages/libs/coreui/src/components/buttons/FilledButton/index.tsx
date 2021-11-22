import { merge } from 'lodash';
import { useMemo } from 'react';

import useUITheme from '../../theming/useUITheme';
import { blue, gray } from '../../../definitions/colors';
import SwissArmyButton, { SwissArmyButtonProps } from '../SwissArmyButton';
import { ButtonStyleSpec } from '../';

export type FilledButtonProps = Omit<SwissArmyButtonProps, 'stylePreset'> & {
  styleOverrides: Partial<ButtonStyleSpec>;
};

/** Basic button with a variety of customization options. */
export default function FilledButton({
  text,
  onPress,
  tooltip,
  size = 'medium',
  icon = () => null,
  role,
  styleOverrides = {},
}: FilledButtonProps) {
  const defaultStyle: ButtonStyleSpec = {
    default: {
      color: blue[500],
      border: {
        radius: 5,
      },
    },
    hover: {
      color: blue[500],
      border: {
        color: blue[600],
        radius: 5,
        width: 2,
        style: 'solid',
      },
    },
    pressed: {
      color: blue[600],
      border: {
        radius: 5,
      },
    },
  };
  const theme = useUITheme();
  const themeStyle = useMemo<Partial<ButtonStyleSpec>>(
    () =>
      theme && role
        ? {
            default: {
              textColor: theme.palette[role].level > 200 ? 'white' : gray[800],
              color: theme.palette[role].hue[theme.palette[role].level],
            },
            hover: {
              textColor: theme.palette[role].level > 200 ? 'white' : gray[800],
              border: {
                color: theme.palette[role].hue[theme.palette[role].level + 100],
                width: 2,
                style: 'solid',
              },
              color: theme.palette[role].hue[theme.palette[role].level],
            },
            pressed: {
              textColor: theme.palette[role].level > 200 ? 'white' : gray[800],
              color: theme.palette[role].hue[theme.palette[role].level + 100],
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
