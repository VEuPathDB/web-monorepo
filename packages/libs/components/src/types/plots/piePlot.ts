import { AvailableUnitsAddon } from '.';

// Pie Plot Type Definitions
export type PiePlotData = {
  slices: Array<PiePlotDatum>;
} & AvailableUnitsAddon;

export type PiePlotDatum = {
  value: number;
  label: string;
  color?: string;
};
