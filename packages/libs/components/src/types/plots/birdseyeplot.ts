import { BarplotData } from './barplot';

export type BirdsEyePlotData = {
  brackets: {
    value: number;
    label: string;
  }[];
  bars: {
    value: number;
    label: string;
    color: string;
  }[];
};
