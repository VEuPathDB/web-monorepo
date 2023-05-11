import { useMemo } from 'react';
import * as t from 'io-ts';
import { ComputationPlugin } from '../../../core/components/computations/Types';
import { ZeroConfigWithButton } from '../../../core/components/computations/ZeroConfiguration';
import { FloatingLayout } from '../../../core/components/layouts/FloatingLayout';
import { LayoutOptions } from '../../../core/components/layouts/types';
import {
  OverlayOptions,
  RequestOptionProps,
  RequestOptions,
} from '../../../core/components/visualizations/options/types';
import { VisualizationPlugin } from '../../../core/components/visualizations/VisualizationPlugin';

import { histogramVisualization } from '../../../core/components/visualizations/implementations/HistogramVisualization';
import { contTableVisualization } from '../../../core/components/visualizations/implementations/MosaicVisualization';
import { scatterplotVisualization } from '../../../core/components/visualizations/implementations/ScatterplotVisualization';
import { lineplotVisualization } from '../../../core/components/visualizations/implementations/LineplotVisualization';
import { barplotVisualization } from '../../../core/components/visualizations/implementations/BarplotVisualization';
import { boxplotVisualization } from '../../../core/components/visualizations/implementations/BoxplotVisualization';
import { OverlayConfig } from '../../../core';
import { boxplotRequest } from './plugins/boxplot';
import { barplotRequest } from './plugins/barplot';
import { lineplotRequest } from './plugins/lineplot';
import { histogramRequest } from './plugins/histogram';
import { scatterplotRequest } from './plugins/scatterplot';

interface Props {
  selectedOverlayConfig?: OverlayConfig;
}

type StandaloneVizOptions = LayoutOptions & OverlayOptions;

export function useStandaloneVizPlugins({
  selectedOverlayConfig,
}: Props): Record<string, ComputationPlugin> {
  return useMemo(() => {
    function vizWithOptions(
      visualization: VisualizationPlugin<StandaloneVizOptions>
    ) {
      return visualization.withOptions({
        hideFacetInputs: true, // will also enable table-only mode for mosaic
        hideShowMissingnessToggle: true,
        layoutComponent: FloatingLayout,
        getOverlayVariable: (_) => selectedOverlayConfig?.overlayVariable,
        getOverlayVariableHelp: () =>
          'The overlay variable can be selected via the top-right panel.',
      });
    }

    function vizWithCustomizedGetRequest<
      ConfigType,
      ExtraProps,
      RequestParamsType
    >(
      visualization: VisualizationPlugin<
        StandaloneVizOptions &
          RequestOptions<ConfigType, ExtraProps, RequestParamsType>
      >,
      requestFunction: (
        props: RequestOptionProps<ConfigType> &
          ExtraProps & {
            overlayConfig: OverlayConfig | undefined;
          }
      ) => RequestParamsType
    ) {
      return visualization.withOptions({
        getRequestParams: (props) => {
          return requestFunction({
            ...props,
            overlayConfig: selectedOverlayConfig,
          });
        },
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
          scatterplot: vizWithCustomizedGetRequest(
            vizWithOptions(scatterplotVisualization),
            scatterplotRequest
          ),
          lineplot: vizWithCustomizedGetRequest(
            vizWithOptions(lineplotVisualization),
            lineplotRequest
          ),
        },
      },
      'standalone-map-distributions': {
        ...pluginBasics,
        visualizationPlugins: {
          histogram: vizWithCustomizedGetRequest(
            vizWithOptions(histogramVisualization),
            histogramRequest
          ),
          boxplot: vizWithCustomizedGetRequest(
            vizWithOptions(boxplotVisualization),
            boxplotRequest
          ),
        },
      },
      'standalone-map-countsandproportions': {
        ...pluginBasics,
        visualizationPlugins: {
          conttable: vizWithOptions(contTableVisualization),
          barplot: vizWithCustomizedGetRequest(
            vizWithOptions(barplotVisualization),
            barplotRequest
          ),
        },
      },
    };
  }, [selectedOverlayConfig]);
}
