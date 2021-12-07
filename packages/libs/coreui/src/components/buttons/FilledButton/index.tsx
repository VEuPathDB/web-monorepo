import { merge } from 'lodash';
import { useMemo } from 'react';

import useUITheme from '../../theming/useUITheme';
import { blue, gray } from '../../../definitions/colors';
import SwissArmyButton from '../SwissArmyButton';
import { ButtonStyleSpec, SwissArmyButtonVariantProps } from '../';

/** Basic button with a variety of customization options. */
export default function FilledButton({
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
      theme && themeRole
        ? {
            default: {
              textColor:
                theme.palette[themeRole].level > 200 ? 'white' : gray[800],
              color:
                theme.palette[themeRole].hue[theme.palette[themeRole].level],
            },
            hover: {
              textColor:
                theme.palette[themeRole].level > 200 ? 'white' : gray[800],
              border: {
                color:
                  theme.palette[themeRole].hue[
                    theme.palette[themeRole].level + 100
                  ],
                width: 2,
                style: 'solid',
              },
              color:
                theme.palette[themeRole].hue[theme.palette[themeRole].level],
            },
            pressed: {
              textColor:
                theme.palette[themeRole].level > 200 ? 'white' : gray[800],
              color:
                theme.palette[themeRole].hue[
                  theme.palette[themeRole].level + 100
                ],
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
