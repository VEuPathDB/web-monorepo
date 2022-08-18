import { CSSProperties } from 'react';
import { Subset } from '../../../definitions/types';

export { default as Toggle } from './Toggle';

import { ThemeRole } from '../../theming/types';

// Type definitions for working with styles.
type SwitchStateStyleSpec = {
  backgroundColor: CSSProperties['color'];
  labelColor: CSSProperties['color'];
  knobColor: CSSProperties['color'];
  borderColor: CSSProperties['color'];
};

export type SwitchStyleSpec = {
  container: React.CSSProperties;
  default: SwitchStateStyleSpec[];
  hover: SwitchStateStyleSpec[];
  disabled: SwitchStateStyleSpec;
};

export type SwitchStyleSpecSubset = Subset<SwitchStyleSpec>;

// Prop definitions.
export type SwitchProps = {
  /** Currently selected option. */
  state: boolean;
  /** Callback to invoke when the switch is flipped. */
  onToggle: (state: boolean) => void;
  /** Text to render beside the toggle. Optional. */
  label?: string;
  /** Position of label. Optional, defaults to left. */
  labelPosition?: 'left' | 'right';
  /** Specification on how switch should be styled. */
  styleSpec: SwitchStyleSpec;
  /** Whether the component is currently disabled for user interactions. */
  disabled?: boolean;
  /** Size of toggle. Optional, defaults to medium. */
  size?: 'medium' | 'small';
};

export type SwitchVariantProps = Omit<
  SwitchProps,
  'styleSpec'
> & {
  themeRole?: ThemeRole;
  styleOverrides?: SwitchStyleSpecSubset;
};
