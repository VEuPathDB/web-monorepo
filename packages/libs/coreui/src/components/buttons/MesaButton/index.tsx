import { merge } from 'lodash';
import { useMemo } from 'react';

import useUITheme from '../../theming/useUITheme';
import { gray } from '../../../definitions/colors';
import SwissArmyButton, { SwissArmyButtonProps } from '../SwissArmyButton';

import { ButtonStyleSpec } from '..';

export type MesaButtonProps = Omit<SwissArmyButtonProps, 'stylePreset'> & {
  styleOverrides: Partial<ButtonStyleSpec>;
};

/** Basic button with a variety of customization options. */
export default function MesaButton({
  text,
  onPress,
  tooltip,
  size = 'medium',
  icon = () => null,
  themeRole,
  styleOverrides = {},
}: MesaButtonProps) {
  const defaultStyle: ButtonStyleSpec = {
    default: {
      color: gray[100],
      textColor: gray[500],
      textTransform: 'none',
      fontWeight: 400,
      border: {
        radius: 5,
      },
      dropShadow: {
        color: gray[300],
        blurRadius: '0px',
        offsetX: '0px',
        offsetY: '3px',
      },
    },
    hover: {
      color: gray[100],
      textColor: gray[500],
      fontWeight: 400,
      textTransform: 'none',
      border: {
        radius: 5,
      },
      dropShadow: {
        color: gray[400],
        blurRadius: '0px',
        offsetX: '0px',
        offsetY: '4px',
      },
    },
    pressed: {
      color: gray[200],
      textColor: gray[500],
      fontWeight: 400,
      textTransform: 'none',
      border: {
        radius: 5,
      },
      dropShadow: {
        color: gray[400],
        blurRadius: '0px',
        offsetX: '0px',
        offsetY: '4px',
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
                theme.palette[themeRole].level > 200 ? 'white' : gray[700],
              color:
                theme.palette[themeRole].hue[theme.palette[themeRole].level],
              textTransform: 'none',
              fontWeight: 400,
              border: {
                radius: 5,
              },
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
              textTransform: 'none',
              fontWeight: 400,
              border: {
                radius: 5,
              },
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
              textTransform: 'none',
              fontWeight: 400,
              border: {
                radius: 5,
              },
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
      style={finalStyle}
      text={text}
      onPress={onPress}
      tooltip={tooltip}
      size={size}
      icon={icon}
      themeRole={themeRole}
    />
  );
}
