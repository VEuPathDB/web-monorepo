import { makeActionCreator } from "../../../Utils/ActionCreatorUtils";

export type DisplayType = 'normal' | 'logarithm';

export const SetBinSize =
  makeActionCreator<number, 'histogram-analysis/set-bin-size'>('histogram-analysis/set-bin-size');

export const SetLogScaleXAxis =
  makeActionCreator<boolean, 'histogram-analysis/set-log-scale-x-axis'>('histogram-analysis/set-log-scale-x-axis');

export const SetLogScaleYAxis =
  makeActionCreator<boolean, 'histogram-analysis/set-log-scale-y-axis'>('histogram-analysis/set-log-scale-y-axis');
