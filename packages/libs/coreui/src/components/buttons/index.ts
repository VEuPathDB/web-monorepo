import { CSSProperties } from 'react';

export type ButtonStyleSpec = {
  container?: React.CSSProperties;
  default: ButtonStateStyleSpec;
  hover: ButtonStateStyleSpec;
  pressed: ButtonStateStyleSpec;
};

type ButtonStateStyleSpec = {
  /** Color to use for outline/fill. Will accept any
   * valid CSS color definition. */
  color?: CSSProperties['color'];
  /**
   * Button text color. If not specified, will default to white.
   */
  textColor?: CSSProperties['color'];
  /** Desired font weight. */
  fontWeight?: CSSProperties['fontWeight'];
  /** Desired text transformation. */
  textTransform?: CSSProperties['textTransform'];
  /** Optional properties for button border. */
  border?: {
    radius?: number;
    style?: CSSProperties['borderStyle'];
    width?: number;
    color?: CSSProperties['borderColor'];
  };
  /** Drop shadow controls */
  dropShadow?: {
    offsetX: string;
    offsetY: string;
    blurRadius: string;
    color: string;
  };
};
