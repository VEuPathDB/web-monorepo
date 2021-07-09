import { AvailableUnitsAddon } from './addOns';

// Pie Plot Type Definitions
export type PiePlotData = {
  slices: Array<PiePlotDatum>;
} & AvailableUnitsAddon;

export type PiePlotDatum = {
  value: number;
  label: string;
  color?: string;
};
