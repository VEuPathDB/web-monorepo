import { CSSProperties } from "react";
import { Subset } from "../../../definitions/types";

export { default as FloatingSwitch } from "./FloatingSwitch";
export { default as FilledSwitch } from "./FilledSwitch";
export { default as OutlinedSwitch } from "./OutlinedSwitch";

import { ThemeRole } from "../../theming/types";

// Type definitions for working with styles.
type SwitchStateStyleSpec = {
  backgroundColor: CSSProperties["color"];
  labelColor: CSSProperties["color"];
  knobColor: CSSProperties["color"];
  borderColor: CSSProperties["color"];
};

export type SwitchStyleSpec = {
  container: React.CSSProperties;
  default: SwitchStateStyleSpec[];
  hover: SwitchStateStyleSpec[];
  disabled: SwitchStateStyleSpec;
  size: "small" | "medium";
};

export type SwitchStyleSpecSubset = Subset<SwitchStyleSpec>;

// Prop definitions.
export type SwitchProps<T extends boolean | string | number> = {
  labels?: {
    left?: string;
    right?: string;
  };
  options: [T, T];
  /** Currently selected option. */
  selectedOption: T;
  /** Callback to invoke when the switch is flipped. */
  onOptionChange: (selection: T) => void;
  /** Specification on how switch should be styled. */
  styleSpec: SwitchStyleSpec;
  /** Whether the component is currently disabled for user interactions. */
  disabled?: boolean;
};

export type SwitchVariantProps<T extends boolean | string | number> = Omit<
  SwitchProps<T>,
  "styleSpec"
> & {
  themeRole?: ThemeRole;
  styleOverrides?: SwitchStyleSpecSubset;
};
