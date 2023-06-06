import { isEqual } from 'lodash';
import { LineplotRequestParams, OverlayConfig } from '../../../../core';
import { LineplotConfig } from '../../../../core/components/visualizations/implementations/LineplotVisualization';
import { RequestOptionProps } from '../../../../core/components/visualizations/options/types';

export type FloatingLineplotExtraProps = {
  errorBars: 'TRUE' | 'FALSE';
  binSpec: Pick<LineplotRequestParams['config'], 'binSpec'>;
  valueSpec: LineplotRequestParams['config']['valueSpec'];
};

export function lineplotRequest(
  props: RequestOptionProps<LineplotConfig> &
    FloatingLineplotExtraProps & {
      overlayConfig: OverlayConfig | undefined;
    }
) {
  const {
    studyId,
    filters,
    vizConfig,
    outputEntityId,
    overlayConfig,
    errorBars,
    binSpec,
    valueSpec,
  } = props;

  return {
    studyId,
    filters,
    config: {
      outputEntityId,
      xAxisVariable: vizConfig.xAxisVariable,
      yAxisVariable: vizConfig.yAxisVariable,
      ...binSpec,
      valueSpec,
      // for floaters, vizConfig.overlayVariable is simply the on/off switch for overlay
      ...(vizConfig.overlayVariable ? { overlayConfig } : {}),
      errorBars,
      ...(valueSpec === 'proportion'
        ? {
            yAxisNumeratorValues: vizConfig.numeratorValues,
            yAxisDenominatorValues: vizConfig.denominatorValues,
          }
        : {}),
    },
  };
}
