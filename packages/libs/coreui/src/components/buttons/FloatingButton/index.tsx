import { merge } from 'lodash';
import { useMemo } from 'react';

import useUITheme from '../../theming/useUITheme';
import { blue, cyan, gray } from '../../../definitions/colors';
import SwissArmyButton, { SwissArmyButtonProps } from '../SwissArmyButton';
import { ButtonStyleSpec } from '../';

export type FloatingButtonProps = Omit<SwissArmyButtonProps, 'stylePreset'> & {
  styleOverrides: Partial<ButtonStyleSpec>;
};

/** Basic button with a variety of customization options. */
export default function FloatingButton({
  text,
  onPress,
  tooltip,
  size = 'medium',
  icon = () => null,
  role,
  styleOverrides = {},
}: FloatingButtonProps) {
  const defaultStyle: ButtonStyleSpec = {
    default: {
      color: 'transparent',
      textColor: cyan[700],
      textTransform: 'none',
      fontWeight: 500,
    },
    hover: {
      color: cyan[100],
      textColor: cyan[700],
      fontWeight: 500,
      textTransform: 'none',
    },
    pressed: {
      color: cyan[200],
      textColor: cyan[700],
      fontWeight: 500,
      textTransform: 'none',
    },
  };

  const theme = useUITheme();
  const themeStyle = useMemo<Partial<ButtonStyleSpec>>(() => {
    if (theme && role) {
      if (theme.palette[role].level < 500) {
        console.warn(
          'The theme color selected may not provide enough contrast to use the FloatingButton component.'
        );
      }

      return {
        default: {
          textColor: theme.palette[role].hue[theme.palette[role].level],
          color: 'transparent',
        },
        hover: {
          textColor: theme.palette[role].hue[theme.palette[role].level],
          color: theme.palette[role].hue[100],
        },
        pressed: {
          textColor: theme.palette[role].hue[theme.palette[role].level],
          color: theme.palette[role].hue[200],
        },
      };
    } else {
      return {};
    }
  }, [theme, role]);

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
