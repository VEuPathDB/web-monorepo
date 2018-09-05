import { makeActionCreator } from "../../../Utils/ActionCreatorUtils";

export type DisplayType = 'normal' | 'logarithm';

export const SetBinSize =
  makeActionCreator<number, 'histogram-analysis/set-bin-size'>('histogram-analysis/set-bin-size');

export const SetDisplayType =
  makeActionCreator<DisplayType, 'histogram-analysis/set-display-type'>('histogram-analysis/set-display-type')