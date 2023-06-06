import { isEqual } from 'lodash';
import { ScatterplotRequestParams, OverlayConfig } from '../../../../core';
import { ScatterplotConfig } from '../../../../core/components/visualizations/implementations/ScatterplotVisualization';
import { RequestOptionProps } from '../../../../core/components/visualizations/options/types';

export type FloatingScatterplotExtraProps = {
  valueSpec: ScatterplotRequestParams['config']['valueSpec'] | undefined;
};

export function scatterplotRequest(
  props: RequestOptionProps<ScatterplotConfig> &
    FloatingScatterplotExtraProps & {
      overlayConfig: OverlayConfig | undefined;
    }
) {
  const {
    studyId,
    filters,
    vizConfig,
    outputEntityId,
    overlayConfig,
    valueSpec,
  } = props;

  return {
    studyId,
    filters,
    config: {
      outputEntityId,
      xAxisVariable: vizConfig.xAxisVariable,
      yAxisVariable: vizConfig.yAxisVariable,
      valueSpec,
      // for floaters, vizConfig.overlayVariable is simply the on/off switch for overlay
      ...(vizConfig.overlayVariable ? { overlayConfig } : {}),
    },
  };
}
