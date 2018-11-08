export type DisplayType = 'normal' | 'logarithm';

//==============================================================================

export const SET_BIN_SIZE = 'histogram-analysis/set-bin-size';

export interface SetBinSizeAction {
  type: typeof SET_BIN_SIZE;
  payload: {
    size: number;
  };
}

export function setBinSize(size: number): SetBinSizeAction {
  return {
    type: SET_BIN_SIZE,
    payload: { size }
  }
}

//==============================================================================

export const ENABLE_LOG_SCALE_X_AXIS = 'histogram-analysis/enable-log-scale-x-axis';

export interface EnableLogScaleXAxisAction {
  type: typeof ENABLE_LOG_SCALE_X_AXIS;
  payload: {
    enable: boolean;
  };
}

export function enableLogScaleXAxis(enable: boolean): EnableLogScaleXAxisAction {
  return {
    type: ENABLE_LOG_SCALE_X_AXIS,
    payload: { enable }
  }
}

//==============================================================================

export const ENABLE_LOG_SCALE_Y_AXIS = 'histogram-analysis/enable-log-scale-y-axis';

export interface EnableLogScaleYAxisAction {
  type: typeof ENABLE_LOG_SCALE_Y_AXIS;
  payload: {
    enable: boolean;
  };
}

export function enableLogScaleYAxis(enable: boolean): EnableLogScaleYAxisAction {
  return {
    type: ENABLE_LOG_SCALE_Y_AXIS,
    payload: { enable }
  }
}

//==============================================================================
