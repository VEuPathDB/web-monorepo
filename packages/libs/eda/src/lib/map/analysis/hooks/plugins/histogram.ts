import { isEqual } from 'lodash';
import { HistogramRequestParams, OverlayConfig } from '../../../../core';
import { HistogramConfig } from '../../../../core/components/visualizations/implementations/HistogramVisualization';
import { RequestOptionProps } from '../../../../core/components/visualizations/options/types';

export type FloatingHistogramExtraProps = {
  binSpec: Pick<HistogramRequestParams['config'], 'binSpec'>;
  valueSpec: HistogramRequestParams['config']['valueSpec'];
  viewport:
    | {
        xMin: string | number;
        xMax: string | number;
      }
    | undefined;
};

export function histogramRequest(
  props: RequestOptionProps<HistogramConfig> &
    FloatingHistogramExtraProps & {
      overlayConfig: OverlayConfig | undefined;
    }
) {
  const {
    studyId,
    filters,
    vizConfig,
    outputEntityId,
    overlayConfig,
    binSpec,
    valueSpec,
    viewport,
  } = props;

  return {
    studyId,
    filters,
    config: {
      outputEntityId,
      xAxisVariable: vizConfig.xAxisVariable,
      barMode: 'stack',
      ...binSpec,
      valueSpec,
      ...(vizConfig.overlayVariable &&
      isEqual(vizConfig.overlayVariable, overlayConfig?.overlayVariable)
        ? { overlayConfig }
        : {}),
      viewport,
    },
  };
}
