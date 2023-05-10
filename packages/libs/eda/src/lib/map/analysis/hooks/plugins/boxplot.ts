import { isEqual } from 'lodash';
import { OverlayConfig } from '../../../../core';
import { BoxplotConfig } from '../../../../core/components/visualizations/implementations/BoxplotVisualization';
import { RequestOptionProps } from '../../../../core/components/visualizations/options/types';

export function boxPlotRequest(
  props: RequestOptionProps<BoxplotConfig> & {
    overlayConfig: OverlayConfig | undefined;
  }
) {
  const { studyId, filters, vizConfig, outputEntityId, overlayConfig } = props;

  return {
    studyId,
    filters,
    config: {
      xAxisVariable: vizConfig.xAxisVariable,
      yAxisVariable: vizConfig.yAxisVariable,
      ...(vizConfig.overlayVariable &&
      isEqual(vizConfig.overlayVariable, overlayConfig?.overlayVariable)
        ? { overlayConfig }
        : {}),
      outputEntityId,
    },
  };
}
