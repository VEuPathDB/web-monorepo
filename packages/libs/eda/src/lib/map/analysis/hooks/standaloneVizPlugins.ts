import { useMemo } from 'react';
import * as t from 'io-ts';
import { ComputationPlugin } from '../../../core/components/computations/Types';
import { ZeroConfigWithButton } from '../../../core/components/computations/ZeroConfiguration';
import { FloatingLayout } from '../../../core/components/layouts/FloatingLayout';
import { LayoutOptions } from '../../../core/components/layouts/types';
import { OverlayOptions } from '../../../core/components/visualizations/options/types';
import { VisualizationPlugin } from '../../../core/components/visualizations/VisualizationPlugin';
import { VariableDescriptor } from '../../../core/types/variable';

import { histogramVisualization } from '../../../core/components/visualizations/implementations/HistogramVisualization';
import { contTableVisualization } from '../../../core/components/visualizations/implementations/MosaicVisualization';
import { scatterplotVisualization } from '../../../core/components/visualizations/implementations/ScatterplotVisualization';
import { lineplotVisualization } from '../../../core/components/visualizations/implementations/LineplotVisualization';
import { barplotVisualization } from '../../../core/components/visualizations/implementations/BarplotVisualization';
import { boxplotVisualization } from '../../../core/components/visualizations/implementations/BoxplotVisualization';

interface Props {
  selectedOverlayVariable?: VariableDescriptor;
}

export function useStandaloneVizPlugins({
  selectedOverlayVariable,
}: Props): Record<string, ComputationPlugin> {
  return useMemo(() => {
    function vizWithOptions(
      visualization: VisualizationPlugin<LayoutOptions & OverlayOptions>
    ) {
      return visualization.withOptions({
        hideFacetInputs: true,
        layoutComponent: FloatingLayout,
        getOverlayVariable: (_) => selectedOverlayVariable,
        getOverlayVariableHelp: () =>
          'The overlay variable can be selected via the top-right panel.',
      });
    }

    const pluginBasics = {
      configurationComponent: ZeroConfigWithButton,
      isConfigurationValid: t.undefined.is,
      createDefaultConfiguration: () => undefined,
    };

    return {
      'standalone-map-xyrelationships': {
        ...pluginBasics,
        visualizationPlugins: {
          scatterplot: vizWithOptions(scatterplotVisualization),
          lineplot: vizWithOptions(lineplotVisualization),
        },
      },
      'standalone-map-distributions': {
        ...pluginBasics,
        visualizationPlugins: {
          histogram: vizWithOptions(histogramVisualization),
          boxplot: vizWithOptions(boxplotVisualization),
        },
      },
      'standalone-map-countsandproportions': {
        ...pluginBasics,
        visualizationPlugins: {
          conttable: vizWithOptions(contTableVisualization),
          barplot: vizWithOptions(barplotVisualization),
        },
      },
    };
  }, [selectedOverlayVariable]);
}
