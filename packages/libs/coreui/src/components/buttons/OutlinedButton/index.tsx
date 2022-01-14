import { merge } from 'lodash';
import { useMemo } from 'react';

import useUITheme from '../../theming/useUITheme';
import { blue, gray } from '../../../definitions/colors';
import SwissArmyButton from '../SwissArmyButton';
import {
  ButtonStyleSpec,
  PartialButtonStyleSpec,
  SwissArmyButtonVariantProps,
} from '..';

/** Basic that has a transparent background, but a visual outline/border. */
export default function OutlinedButton({
  text,
  textTransform,
  onPress,
  disabled = false,
  tooltip,
  size = 'medium',
  icon = () => null,
  themeRole,
  styleOverrides = {},
}: SwissArmyButtonVariantProps) {
  const defaultStyle: ButtonStyleSpec = {
    default: {
      textColor: blue[500],
      fontWeight: 600,
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
      fontWeight: 600,
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
      fontWeight: 600,
      color: 'transparent',
      border: {
        radius: 5,
        color: blue[700],
        style: 'solid',
        width: 2,
      },
    },
    disabled: {
      textColor: gray[500],
      fontWeight: 600,
      color: 'transparent',
      border: {
        radius: 5,
        color: gray[500],
        style: 'solid',
        width: 2,
      },
    },
  };

  const theme = useUITheme();
  const themeStyle = useMemo<PartialButtonStyleSpec>(
    () =>
      theme && themeRole
        ? {
            default: {
              textColor:
                theme.palette[themeRole].hue[theme.palette[themeRole].level],
              border: {
                color:
                  theme.palette[themeRole].hue[theme.palette[themeRole].level],
              },
            },
            hover: {
              textColor:
                theme.palette[themeRole].hue[
                  theme.palette[themeRole].level + 100
                ],
              border: {
                color:
                  theme.palette[themeRole].hue[
                    theme.palette[themeRole].level + 100
                  ],
              },
            },
            pressed: {
              textColor:
                theme.palette[themeRole].hue[
                  theme.palette[themeRole].level + 200
                ],
              border: {
                color:
                  theme.palette[themeRole].hue[
                    theme.palette[themeRole].level + 200
                  ],
              },
            },
          }
        : {},
    [theme, themeRole]
  );

  const finalStyle = useMemo(
    () => merge({}, defaultStyle, themeStyle, styleOverrides),
    [themeStyle]
  );

  return (
    <SwissArmyButton
      styleSpec={finalStyle}
      text={text}
      textTransform={textTransform}
      disabled={disabled}
      onPress={onPress}
      tooltip={tooltip}
      size={size}
      icon={icon}
    />
  );
}
