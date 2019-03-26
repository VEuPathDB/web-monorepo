import { makeActionCreator, InferAction } from "wdk-client/Utils/ActionCreatorUtils";

export const openView = makeActionCreator(
  'histogram-analysis/open-view',
  (reporterName: string, stepId: number) => ({ reporterName, stepId })
)

export const closeView = makeActionCreator(
  'histogram-analysis/close-view',
  (reporterName: string, stepId: number) => ({ reporterName, stepId })
)

export const setBinSize = makeActionCreator(
  'histogram-analysis/set-bin-size',
  (size: number) => ({ size })
)

export const enableLogScaleXAxis = makeActionCreator(
  'histogram-analysis/enable-log-scale-x-axis',
  (enable: boolean) => ({ enable })
)

export const enableLogScaleYAxis = makeActionCreator(
  'histogram-analysis/enable-log-scale-y-axis',
  (enable: boolean) => ({ enable })
)

export type Action =
  | InferAction<typeof openView>
  | InferAction<typeof closeView>
  | InferAction<typeof setBinSize>
  | InferAction<typeof enableLogScaleXAxis>
  | InferAction<typeof enableLogScaleYAxis>