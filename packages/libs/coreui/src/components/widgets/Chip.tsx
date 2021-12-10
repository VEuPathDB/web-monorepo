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
  themeRole,
  styleOverrides,
}: ChipProps) {
  const [currentlyHovered, setCurrentlyHovered] = useState(false);
  const [currentlyPressed, setCurrentlyPressed] = useState(false);

  const buttonState = useMemo<'default' | 'hover' | 'pressed'>(
    () =>
      currentlyPressed ? 'pressed' : currentlyHovered ? 'hover' : 'default',
    [currentlyHovered, currentlyPressed]
  );

  const defaultStyle: ChipStyleSpec = {
    default: {
      textColor: gray[400],
      backgroundColor: 'white',
      border: {
        width: 1,
        color: gray[400],
        radius: 5,
      },
    },
    hover: {
      textColor: blue[500],
      backgroundColor: blue[100],
      border: {
        width: 1,
        color: blue[500],
        radius: 5,
      },
    },
    pressed: {
      textColor: blue[500],
      backgroundColor: blue[100],
      border: {
        width: 2,
        color: blue[500],
        radius: 5,
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
                radius: 5,
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
                radius: 5,
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
      onMouseEnter={() => setCurrentlyHovered(true)}
      onMouseLeave={() => setCurrentlyHovered(false)}
      onMouseDown={() => setCurrentlyPressed(true)}
      onMouseUp={() => setCurrentlyPressed(false)}
      css={[
        typography.secondaryFont,
        {
          fontSize: 12,
          height: 25,
          backgroundColor: finalStyle[buttonState].backgroundColor,
          outlineColor: finalStyle[buttonState].border.color,
          outlineWidth: finalStyle[buttonState].border.width,
          outlineStyle: 'solid',
          borderRadius: finalStyle[buttonState].border.radius,
          border: 'none',
          color: finalStyle[buttonState].textColor,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          paddingLeft: 10,
          paddingRight: 10,
        },
      ]}
    >
      <span>{text}</span>
      <Icon
        fontSize={14}
        fill={finalStyle[buttonState].border.color}
        css={{ marginLeft: 10 }}
      />
    </button>
  );
}
