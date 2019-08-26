import { makeActionCreator, InferAction } from "wdk-client/Utils/ActionCreatorUtils";
import {ResultType} from 'wdk-client/Utils/WdkResult';

export const openView = makeActionCreator(
  'histogram-analysis/open-view',
  (reporterName: string, resultType: ResultType) => ({ reporterName, resultType })
)

export const closeView = makeActionCreator(
  'histogram-analysis/close-view',
  (reporterName: string, resultType: ResultType) => ({ reporterName, resultType })
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
