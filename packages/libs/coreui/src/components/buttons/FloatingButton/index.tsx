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

/** Button that has no background until hovered/pressed. */
export default function FloatingButton({
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
}: SwissArmyButtonVariantProps) {
  const defaultStyle: ButtonStyleSpec = {
    default: {
      color: 'transparent',
      textColor: blue[500],
      fontWeight: 600,
    },
    hover: {
      color: blue[100],
      textColor: blue[500],
      fontWeight: 600,
    },
    pressed: {
      color: blue[200],
      textColor: blue[600],
      fontWeight: 600,
    },
    disabled: {
      color: 'transparent',
      textColor: gray[500],
      fontWeight: 600,
    },
  };

  const theme = useUITheme();
  const themeStyle = useMemo<PartialButtonStyleSpec>(() => {
    if (theme && themeRole) {
      if (theme.palette[themeRole].level < 500) {
        console.warn(
          'The theme color selected may not provide enough contrast to use the FloatingButton component.'
        );
      }

      return {
        default: {
          textColor:
            theme.palette[themeRole].hue[theme.palette[themeRole].level],
          color: 'transparent',
        },
        hover: {
          textColor:
            theme.palette[themeRole].hue[theme.palette[themeRole].level],
          color: theme.palette[themeRole].hue[100],
        },
        pressed: {
          textColor:
            theme.palette[themeRole].hue[theme.palette[themeRole].level + 100],
          color: theme.palette[themeRole].hue[200],
        },
      };
    } else {
      return {};
    }
  }, [theme, themeRole]);

  const finalStyle = useMemo(
    () => merge({}, defaultStyle, themeStyle, styleOverrides),
    [themeStyle]
  );

  return (
    <SwissArmyButton
      disabled={disabled}
      styleSpec={finalStyle}
      text={text}
      textTransform={textTransform}
      onPress={onPress}
      tooltip={tooltip}
      size={size}
      icon={icon}
      ariaLabel={ariaLabel}
    />
  );
}
