import { CSSProperties } from 'react';
import { gray, blue, mutedBlue, cyan } from '../../../definitions/colors';

export type SwissArmyButtonStyleSpec = {
  container?: React.CSSProperties;
  default: ButtonStyleSpec;
  hover: ButtonStyleSpec;
  pressed: ButtonStyleSpec;
};

type ButtonStyleSpec = {
  /** Color to use for outline/fill. Will accept any
   * valid CSS color definition. Defaults to LIGHT_BLUE */
  color: string;
  /**
   * Button text color. If not specified, will default
   * to `color` for `outlined` buttons and `white`
   * for `solid` buttons.
   */
  textColor?: string;
  /** Desired font weight. */
  fontWeight?: CSSProperties['fontWeight'];
  /** Desired text transformation. */
  textTransform?: CSSProperties['textTransform'];
  /** Border radius to apply to button. */
  borderRadius?: number;
  /** Drop shadow controls */
  dropShadow?: {
    offsetX: string;
    offsetY: string;
    blurRadius: string;
    color: string;
  };
};

export const stylePresets: {
  [Property in 'default' | 'mesa' | 'borderless']: SwissArmyButtonStyleSpec;
} = {
  default: {
    default: {
      color: mutedBlue[400],
      borderRadius: 5,
    },
    hover: { color: blue[400], borderRadius: 5 },
    pressed: {
      color: blue[500],
      borderRadius: 5,
    },
  },
  borderless: {
    default: {
      color: 'transparent',
      textColor: blue[500],
      textTransform: 'none',
      fontWeight: 500,
    },
    hover: {
      color: cyan[100],
      textColor: blue[500],
      fontWeight: 500,
      textTransform: 'none',
    },
    pressed: {
      color: cyan[200],
      textColor: blue[500],
      fontWeight: 500,
      textTransform: 'none',
    },
  },
  mesa: {
    default: {
      color: 'rgba(0, 0, 0, .05)',
      textColor: gray[500],
      textTransform: 'none',
      fontWeight: 400,
      borderRadius: 5,
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
      borderRadius: 5,
      dropShadow: {
        color: gray[300],
        blurRadius: '0px',
        offsetX: '0px',
        offsetY: '3px',
      },
    },
    pressed: {
      color: 'rgba(0, 0, 0, .15)',
      textColor: gray[500],
      fontWeight: 400,
      textTransform: 'none',
      borderRadius: 5,
      dropShadow: {
        color: gray[300],
        blurRadius: '0px',
        offsetX: '0px',
        offsetY: '3px',
      },
    },
  },
};
