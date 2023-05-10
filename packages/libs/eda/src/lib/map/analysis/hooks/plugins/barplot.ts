import { isEqual } from 'lodash';
import { OverlayConfig } from '../../../../core';
import { BarplotConfig } from '../../../../core/components/visualizations/implementations/BarplotVisualization';
import { RequestOptionProps } from '../../../../core/components/visualizations/options/types';

export function barplotRequest(
  props: RequestOptionProps<BarplotConfig> & {
    overlayConfig: OverlayConfig | undefined;
  }
) {
  const { studyId, filters, vizConfig, outputEntityId, overlayConfig } = props;

  return {
    studyId,
    filters,
    config: {
      xAxisVariable: vizConfig.xAxisVariable,
      ...(vizConfig.overlayVariable &&
      isEqual(vizConfig.overlayVariable, overlayConfig?.overlayVariable)
        ? { overlayConfig }
        : {}),
      outputEntityId,
      barMode: 'group',
    },
  };
}
