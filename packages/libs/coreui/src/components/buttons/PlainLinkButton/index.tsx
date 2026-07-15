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

/**
 * A button that looks like a plain hyperlink: no border, no fill, underlined
 * text in the theme's link colour. Use for secondary/escape actions (e.g.
 * "Back to gene page") that shouldn't compete visually with the filled/outlined
 * primary actions, while keeping button semantics (onPress, not navigation).
 */
export default function PlainLinkButton({
  text,
  textTransform,
  onPress,
  disabled = false,
  tooltip,
  size = 'medium',
  icon = () => null,
  themeRole,
  styleOverrides = {},
  iconPosition = 'left',
  additionalAriaProperties = {},
}: SwissArmyButtonVariantProps) {
  // Strip the button chrome: transparent background, zero-width border, no
  // horizontal padding, auto height, and an underline so it reads as a link.
  const noBorder = { radius: 0, color: 'transparent', style: 'none', width: 0 };
  const linkContainer: PartialButtonStyleSpec['container'] = {
    paddingLeft: 0,
    paddingRight: 0,
    height: 'auto',
    textDecoration: 'underline',
  };

  const defaultStyle: ButtonStyleSpec = {
    container: linkContainer,
    default: {
      textColor: blue[500],
      fontWeight: 400,
      color: 'transparent',
      border: noBorder,
    },
    hover: {
      textColor: blue[600],
      fontWeight: 400,
      color: 'transparent',
      border: noBorder,
    },
    pressed: {
      textColor: blue[700],
      fontWeight: 400,
      color: 'transparent',
      border: noBorder,
    },
    disabled: {
      textColor: gray[500],
      fontWeight: 400,
      color: 'transparent',
      border: noBorder,
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
            },
            hover: {
              textColor:
                theme.palette[themeRole].hue[
                  theme.palette[themeRole].level + 100
                ],
            },
            pressed: {
              textColor:
                theme.palette[themeRole].hue[
                  theme.palette[themeRole].level + 200
                ],
            },
          }
        : {},
    [theme, themeRole]
  );

  const finalStyle = useMemo(
    () => merge({}, defaultStyle, themeStyle, styleOverrides),
    [defaultStyle, themeStyle, styleOverrides]
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
      iconPosition={iconPosition}
      additionalAriaProperties={additionalAriaProperties}
    />
  );
}
