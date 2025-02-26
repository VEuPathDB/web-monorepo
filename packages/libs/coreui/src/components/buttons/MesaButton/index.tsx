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

/** Button that has a two-tone appearance. */
export default function MesaButton({
  text,
  textTransform,
  onPress,
  disabled = false,
  tooltip,
  size = 'medium',
  icon = () => null,
  themeRole,
  styleOverrides = {},
  ariaLabel,
  iconPosition = 'left',
  additionalAriaProperties = {},
}: SwissArmyButtonVariantProps) {
  const defaultStyle: ButtonStyleSpec = {
    default: {
      color: blue[500],
      textColor: 'white',
      fontWeight: 600,
      border: {
        radius: 5,
      },
      dropShadow: {
        color: blue[600],
        blurRadius: '0px',
        offsetX: '0px',
        offsetY: '3px',
      },
    },
    hover: {
      color: blue[500],
      textColor: 'white',
      fontWeight: 600,
      border: {
        radius: 5,
      },
      dropShadow: {
        color: blue[700],
        blurRadius: '0px',
        offsetX: '0px',
        offsetY: '4px',
      },
    },
    pressed: {
      color: blue[600],
      textColor: 'white',
      fontWeight: 600,
      border: {
        radius: 5,
      },
      dropShadow: {
        color: blue[700],
        blurRadius: '0px',
        offsetX: '0px',
        offsetY: '4px',
      },
    },
    disabled: {
      color: gray[500],
      textColor: 'white',
      fontWeight: 600,
      border: {
        radius: 5,
      },
      dropShadow: {
        color: gray[600],
        blurRadius: '0px',
        offsetX: '0px',
        offsetY: '3px',
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
                theme.palette[themeRole].level > 200 ? 'white' : gray[700],
              color:
                theme.palette[themeRole].hue[theme.palette[themeRole].level],
              dropShadow: {
                color:
                  theme.palette[themeRole].hue[
                    theme.palette[themeRole].level + 100
                  ],
                blurRadius: '0px',
                offsetX: '0px',
                offsetY: '3px',
              },
            },
            hover: {
              textColor:
                theme.palette[themeRole].level > 200 ? 'white' : gray[700],
              color:
                theme.palette[themeRole].hue[theme.palette[themeRole].level],
              dropShadow: {
                color:
                  theme.palette[themeRole].hue[
                    theme.palette[themeRole].level + 200
                  ],
                blurRadius: '0px',
                offsetX: '0px',
                offsetY: '4px',
              },
            },
            pressed: {
              textColor:
                theme.palette[themeRole].level > 200 ? 'white' : gray[700],
              color:
                theme.palette[themeRole].hue[
                  theme.palette[themeRole].level + 100
                ],
              dropShadow: {
                color:
                  theme.palette[themeRole].hue[
                    theme.palette[themeRole].level + 300
                  ],
                blurRadius: '0px',
                offsetX: '0px',
                offsetY: '4px',
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
