import {
  useMemo,
  useState,
  SVGProps,
  CSSProperties,
  ComponentType,
} from 'react';
import { merge } from 'lodash';

// Definitions
import { blue, gray } from '../../definitions/colors';
import typography from '../../styleDefinitions/typography';
import { UITheme } from '../theming/types';

// Hooks
import useUITheme from '../theming/useUITheme';

type ChipStateStyleSpec = {
  textColor: CSSProperties['color'];
  backgroundColor: CSSProperties['backgroundColor'];
  border: {
    width: number;
    color: CSSProperties['borderColor'];
    radius: CSSProperties['borderRadius'];
  };
};

export type ChipStyleSpec = {
  container?: CSSProperties;
  default: ChipStateStyleSpec;
  hover: ChipStateStyleSpec;
  pressed: ChipStateStyleSpec;
};

export type ChipProps = {
  /** The text of the chip. */
  text: string;
  /** An optional function to call when the chip is pressed. */
  onPress?: () => void;
  /** Optional. SVG component to use as an icon. */
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  /**
   * Optional. Used to indicate if you want the style of the chip
   * to be locked at a certain button state. */
  staticState?: 'default' | 'hover' | 'pressed';
  /**
   * Optional. Used to indicate which color properties to calculate based on
   * a UI theme. Not indicating a value here will mean that button should not
   * pick up styling options from the theme. */
  themeRole?: keyof UITheme['palette'];
  /** Optional. Style overrides. */
  styleOverrides?: Partial<ChipStyleSpec>;
};

export default function Chip({
  text,
  icon = () => null,
  onPress,
  staticState,
  themeRole,
  styleOverrides,
}: ChipProps) {
  const defaultStyle: ChipStyleSpec = {
    default: {
      textColor: gray[400],
      backgroundColor: 'white',
      border: {
        width: 1,
        color: gray[400],
        radius: 10,
      },
    },
    hover: {
      textColor: blue[500],
      backgroundColor: blue[100],
      border: {
        width: 1,
        color: blue[500],
        radius: 10,
      },
    },
    pressed: {
      textColor: blue[500],
      backgroundColor: blue[100],
      border: {
        width: 2,
        color: blue[500],
        radius: 10,
      },
    },
  };

  const theme = useUITheme();
  const themeStyle = useMemo<Partial<ChipStyleSpec>>(
    () =>
      theme && themeRole
        ? {
            hover: {
              backgroundColor: theme.palette[themeRole].hue[100],
              textColor:
                theme.palette[themeRole].hue[theme.palette[themeRole].level],
              border: {
                width: 1,
                color:
                  theme.palette[themeRole].hue[theme.palette[themeRole].level],
                radius: 10,
              },
            },
            pressed: {
              backgroundColor: theme.palette[themeRole].hue[100],
              textColor:
                theme.palette[themeRole].hue[theme.palette[themeRole].level],
              border: {
                width: 2,
                color:
                  theme.palette[themeRole].hue[theme.palette[themeRole].level],
                radius: 10,
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

  const Icon = icon;

  return (
    <button
      onClick={onPress}
      css={[
        {
          ...finalStyle.container,
          pointerEvents: staticState ? 'none' : 'initial',
        },
        {
          fontFamily: typography.secondaryFont,
          cursor: onPress ? 'grab' : 'default',
          fontSize: 12,
          height: 25,
          backgroundColor: finalStyle[staticState ?? 'default'].backgroundColor,
          outlineColor: finalStyle[staticState ?? 'default'].border.color,
          outlineWidth: finalStyle[staticState ?? 'default'].border.width,
          outlineStyle: 'solid',
          borderRadius: finalStyle[staticState ?? 'default'].border.radius,
          border: 'none',
          color: finalStyle[staticState ?? 'default'].textColor,
          fill: finalStyle[staticState ?? 'default'].border.color,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          paddingLeft: 10,
          paddingRight: 10,
          ':hover': {
            backgroundColor: finalStyle[staticState ?? 'hover'].backgroundColor,
            outlineColor: finalStyle[staticState ?? 'hover'].border.color,
            outlineWidth: finalStyle[staticState ?? 'hover'].border.width,
            borderRadius: finalStyle[staticState ?? 'hover'].border.radius,
            color: finalStyle[staticState ?? 'hover'].textColor,
            fill: finalStyle[staticState ?? 'hover'].border.color,
          },
          ':active': {
            backgroundColor:
              finalStyle[staticState ?? 'pressed'].backgroundColor,
            outlineColor: finalStyle[staticState ?? 'pressed'].border.color,
            outlineWidth: finalStyle[staticState ?? 'pressed'].border.width,
            borderRadius: finalStyle[staticState ?? 'pressed'].border.radius,
            color: finalStyle[staticState ?? 'pressed'].textColor,
            fill: finalStyle[staticState ?? 'pressed'].border.color,
          },
        },
      ]}
    >
      {text}
      <Icon fontSize={14} css={{ marginLeft: 10 }} />
    </button>
  );
}
