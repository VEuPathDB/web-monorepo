import { CSSProperties } from 'react';
import {
  DARK_BLUE,
  DARK_GRAY,
  LIGHT_BLUE,
  LIGHT_GRAY,
} from '../../../constants/colors';

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
      color: LIGHT_BLUE,
      borderRadius: 5,
    },
    hover: { color: LIGHT_BLUE, borderRadius: 5 },
    pressed: {
      color: DARK_BLUE,
      borderRadius: 5,
    },
  },
  borderless: {
    default: {
      color: 'transparent',
      textColor: '#006699',
      textTransform: 'none',
      fontWeight: 500,
    },
    hover: {
      color: '#E6F7FF',
      textColor: '#006699',
      fontWeight: 500,
      textTransform: 'none',
    },
    pressed: {
      color: '#B3E5FF',
      textColor: '#006699',
      fontWeight: 500,
      textTransform: 'none',
    },
  },
  mesa: {
    default: {
      color: LIGHT_GRAY,
      textColor: DARK_GRAY,
      textTransform: 'none',
      fontWeight: 400,
      borderRadius: 5,
      dropShadow: {
        color: '#999',
        blurRadius: '0px',
        offsetX: '0px',
        offsetY: '3px',
      },
    },
    hover: {
      color: 'rgba(0, 0, 0, .1)',
      textColor: DARK_GRAY,
      fontWeight: 400,
      textTransform: 'none',
      borderRadius: 5,
      dropShadow: {
        color: '#999',
        blurRadius: '0px',
        offsetX: '0px',
        offsetY: '3px',
      },
    },
    pressed: {
      color: 'rgba(0, 0, 0, .15)',
      textColor: DARK_GRAY,
      fontWeight: 400,
      textTransform: 'none',
      borderRadius: 5,
      dropShadow: {
        color: '#999',
        blurRadius: '0px',
        offsetX: '0px',
        offsetY: '3px',
      },
    },
  },
};
