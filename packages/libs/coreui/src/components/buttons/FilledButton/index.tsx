import { merge } from 'lodash';
import { useMemo } from 'react';

import useUITheme from '../../theming/useUITheme';
import { blue, gray } from '../../../definitions/colors';
import SwissArmyButton from '../SwissArmyButton';
import {
  ButtonStyleSpec,
  PartialButtonStyleSpec,
  SwissArmyButtonVariantProps,
} from '../';

/** Button with a filled background. */
export default function FilledButton({
  text,
  textTransform,
  onPress,
  disabled = false,
  tooltip,
  size = 'medium',
  icon = () => null,
  ariaLabel,
  themeRole,
  styleOverrides = {},
  iconPosition = 'left',
  additionalAriaProperties = {},
}: SwissArmyButtonVariantProps) {
  const defaultStyle: ButtonStyleSpec = {
    default: {
      color: blue[500],
      border: {
        radius: 5,
      },
      fontWeight: 600,
      textColor: 'white',
    },
    hover: {
      color: blue[500],
      fontWeight: 600,
      textColor: 'white',
      border: {
        color: blue[600],
        radius: 5,
        width: 2,
        style: 'solid',
      },
    },
    pressed: {
      color: blue[600],
      fontWeight: 600,
      textColor: 'white',
      border: {
        radius: 5,
      },
    },
    disabled: {
      color: gray[500],
      textColor: 'white',
      fontWeight: 600,
    },
  };
  const theme = useUITheme();
  const themeStyle = useMemo<PartialButtonStyleSpec>(
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
      textTransform={textTransform}
      onPress={onPress}
      disabled={disabled}
      tooltip={tooltip}
      size={size}
      icon={icon}
      ariaLabel={ariaLabel}
      iconPosition={iconPosition}
      additionalAriaProperties={additionalAriaProperties}
    />
  );
}
