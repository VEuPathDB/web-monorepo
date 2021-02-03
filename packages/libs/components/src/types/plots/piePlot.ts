import { NumberOrDate } from '../general';

// Pie Plot Type Definitions
export type PiePlotData = Array<PiePlotDatum>;
export type PiePlotDatum = {
  value: NumberOrDate;
  label: string;
  color?: string;
};
