import { CSSProperties } from 'react';
import { Subset } from '../../../definitions/types';

export { default as FloatingSwitch } from './FloatingSwitch';
export { default as FilledSwitch } from './FilledSwitch';
export { default as OutlinedSwitch } from './OutlinedSwitch';

import { ThemeRole } from '../../theming/types';

// Type definitions for working with styles.
type SwitchStateStyleSpec = {
  backgroundColor: CSSProperties['color'];
  labelColor: CSSProperties['color'];
  knobColor: CSSProperties['color'];
  borderColor: CSSProperties['color'];
};

export type SwitchStyleSpec = {
  container?: React.CSSProperties;
  default: SwitchStateStyleSpec[];
  hover: SwitchStateStyleSpec[];
  disabled: SwitchStateStyleSpec;
};

export type SwitchStyleSpecSubset = Subset<SwitchStyleSpec>;

// Prop definitions.
export type SwitchProps = {
  labels?: {
    left?: string;
    right?: string;
  };
  options: [true, false] | [string, string] | [number, number];
  /** Currently selected option. */
  selectedOption: boolean | string | number;
  /** Callback to invoke when the switch is flipped. */
  onOptionChange: (selection: boolean | string | number) => void;
  /** Specification on how switch should be styled. */
  styleSpec: SwitchStyleSpec;
  /** Whether the component is currently disabled for user interactions. */
  disabled: boolean;
};

export type SwitchVariantProps = Omit<SwitchProps, 'styleSpec'> & {
  themeRole?: ThemeRole;
  styleOverrides?: SwitchStyleSpecSubset;
};
