import React, {
  AriaAttributes,
  ButtonHTMLAttributes,
  CSSProperties,
} from 'react';
import { SvgIconComponent } from '@material-ui/icons';

import { UITheme } from '../theming';

export type PartialButtonStyleSpec = {
  container?: React.CSSProperties;
  default?: Partial<ButtonStateStyleSpec>;
  hover?: Partial<ButtonStateStyleSpec>;
  pressed?: Partial<ButtonStateStyleSpec>;
  disabled?: Partial<ButtonStateStyleSpec>;
};

export type ButtonStyleSpec = {
  container?: React.CSSProperties;
  default: ButtonStateStyleSpec;
  hover: ButtonStateStyleSpec;
  pressed: ButtonStateStyleSpec;
  disabled: ButtonStateStyleSpec;
  icon?: {
    fontSize: CSSProperties['fontSize'];
  };
};

type ButtonStateStyleSpec = {
  /** Color to use for outline/fill. Will accept any
   * valid CSS color definition. */
  color: CSSProperties['color'];
  /**
   * Button text color. If not specified, will default to white.
   */
  textColor: CSSProperties['color'];
  /** Desired font weight. */
  fontWeight: CSSProperties['fontWeight'];
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
    color: CSSProperties['color'];
  };
};

type CoreProps = {
  /**
   * Optional. Desired text transformation. Was originally part of styleOverrides,
   * but moved into a separate prop for client convenience purposes. */
  textTransform?: CSSProperties['textTransform'];
  /** Action to take when the button is clicked. */
  onPress:
    | (() => void)
    | ((event: React.MouseEvent<HTMLButtonElement>) => void);
  /** Optional. Indicates if the button is disabled. */
  disabled?: boolean;
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
  styleOverrides?: PartialButtonStyleSpec;
  /** Icon can be to the left or to the right of the button's text. Defaults to left. */
  iconPosition?: 'left' | 'right';
  /** Can specify additional aria properties as needed. Used in PopoverButton */
  additionalAriaProperties?: Partial<
    ButtonHTMLAttributes<HTMLButtonElement> & AriaAttributes
  >;
};

/**
 * Important Note
 * There is built in support here for passing in icons from the material-ui/icons
 * package on NPM. However - be aware this is only know to work with icons
 * from version 4 of that library. Additional work may be needed to support
 * icons from version 5 of that library.
 *
 * It is recommended that icons for use in VeuPathDB websites be built
 * and incorporated inside this library to ensure compatibility.
 */
type TextIconProps =
  | {
      text?: string;
      /** SVG component to use as an icon. */
      icon:
        | React.ComponentType<React.SVGProps<SVGSVGElement>>
        | SvgIconComponent;
      /** ariaDescription. Required when a button only includes an icon. */
      ariaLabel: string;
    }
  | {
      /** Text of the button. */
      text: string | React.ReactNode;
      /** Optional. SVG component to use as an icon. */
      icon?:
        | React.ComponentType<React.SVGProps<SVGSVGElement>>
        | SvgIconComponent;
      /** ariaDescription. Optional when a button only includes text. */
      ariaLabel?: string;
    };

// Type definition for buttons that derive from SwissArmyButton
export type SwissArmyButtonVariantProps = CoreProps & TextIconProps;

export { default as FilledButton } from './FilledButton';
export { default as FloatingButton } from './FloatingButton';
export { default as MesaButton } from './MesaButton';
export { default as OutlinedButton } from './OutlinedButton';
