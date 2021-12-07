import { CSSProperties } from 'react';
import { UITheme } from '../theming';

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

type CoreProps = {
  /** Action to take when the button is clicked. */
  onPress: () => void;
  /** Optional. Text to display as a tooltip when button is hovered over. */
  tooltip?: string;
  /**
   * Optional. Used to indicate which color properties to calculate based on
   * a UI theme. Not indicating a value here will mean that button should not
   * pick up styling options from the theme. */
  themeRole?: keyof UITheme['palette'];
  /** The size of the button. */
  size?: 'small' | 'medium' | 'large';
  /** Additional styles to apply to the button container. */
  styleOverrides?: Partial<ButtonStyleSpec>;
};

type TextIconProps =
  | {
      iconOnly?: false;
      /** Text of the button. */
      text: string;
      /** Optional. SVG component to use as an icon. */
      icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    }
  | {
      iconOnly: true;
      text?: never;
      /** SVG component to use as an icon. */
      icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    };

// Type definition for buttons that derive from SwissArmyButton
export type SwissArmyButtonVariantProps = CoreProps & TextIconProps;

export { default as FilledButton } from './FilledButton';
export { default as FloatingButton } from './FloatingButton';
export { default as MesaButton } from './MesaButton';
export { default as OutlinedButton } from './OutlinedButton';
