import { merge } from 'lodash';
import { useMemo } from 'react';

import useUITheme from '../../theming/useUITheme';
import { blue } from '../../../definitions/colors';
import SwissArmyButton from '../SwissArmyButton';
import { ButtonStyleSpec, SwissArmyButtonVariantProps } from '..';

/** Basic button with a variety of customization options. */
export default function OutlinedButton({
  text,
  onPress,
  tooltip,
  size = 'medium',
  icon = () => null,
  themeRole,
  styleOverrides = {},
  iconOnly,
}: SwissArmyButtonVariantProps) {
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
      onPress={onPress}
      tooltip={tooltip}
      size={size}
      icon={icon}
      themeRole={themeRole}
      iconOnly={iconOnly}
    />
  );
}
