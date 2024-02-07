import { ReactNode, useMemo } from 'react';
import * as t from 'io-ts';
import { ComputationPlugin } from '../../../core/components/computations/Types';
import { ZeroConfiguration } from '../../../core/components/computations/ZeroConfiguration';
import { FloatingLayout } from '../../../core/components/layouts/FloatingLayout';
import { LayoutOptions } from '../../../core/components/layouts/types';
import {
  OverlayOptions,
  RequestOptionProps,
  RequestOptions,
  VerbiageOptions,
} from '../../../core/components/visualizations/options/types';
import { VisualizationPlugin } from '../../../core/components/visualizations/VisualizationPlugin';

import { histogramVisualization } from '../../../core/components/visualizations/implementations/HistogramVisualization';
import { contTableVisualization } from '../../../core/components/visualizations/implementations/MosaicVisualization';
import { scatterplotVisualization } from '../../../core/components/visualizations/implementations/ScatterplotVisualization';
import { lineplotVisualization } from '../../../core/components/visualizations/implementations/LineplotVisualization';
import { barplotVisualization } from '../../../core/components/visualizations/implementations/BarplotVisualization';
import { boxplotVisualization } from '../../../core/components/visualizations/implementations/BoxplotVisualization';
import {
  BinDefinitions,
  OverlayConfig,
  BubbleOverlayConfig,
} from '../../../core';
import { boxplotRequest } from './plugins/boxplot';
import { barplotRequest } from './plugins/barplot';
import { lineplotRequest } from './plugins/lineplot';
import { histogramRequest } from './plugins/histogram';
import { scatterplotRequest } from './plugins/scatterplot';

import TimeSeriesSVG from '../../../core/components/visualizations/implementations/selectorIcons/TimeSeriesSVG';
import _ from 'lodash';
import { EntitySubtitleForViz } from '../mapTypes/shared';

interface Props {
  selectedOverlayConfig?: OverlayConfig | BubbleOverlayConfig;
  overlayHelp?: ReactNode;
  selectedMarkers?: string[] | undefined;
}

type StandaloneVizOptions = LayoutOptions & OverlayOptions & VerbiageOptions;

export function useStandaloneVizPlugins({
  selectedOverlayConfig,
  overlayHelp = 'The overlay variable can be selected via the top-right panel.',
  selectedMarkers,
}: Props): Record<string, ComputationPlugin> {
  return useMemo(() => {
    function vizWithOptions(
      visualization: VisualizationPlugin<StandaloneVizOptions>
    ) {
      return visualization.withOptions({
        hideFacetInputs: true, // will also enable table-only mode for mosaic
        hideShowMissingnessToggle: true,
        layoutComponent: FloatingLayout,
        // why are we providing three functions to access the properties of
        // one object? Because in the pre-SAM world, getOverlayVariable was already
        // part of this interface.
        getOverlayVariable: (_) => selectedOverlayConfig?.overlayVariable,
        getOverlayType: () =>
          _.get(selectedOverlayConfig, 'overlayType') ??
          _.get(selectedOverlayConfig, 'aggregationConfig.overlayType'),
        getOverlayVocabulary: () => {
          const overlayValues =
            selectedOverlayConfig && 'overlayValues' in selectedOverlayConfig
              ? selectedOverlayConfig.overlayValues
              : undefined;
          if (overlayValues == null) return undefined;
          if (BinDefinitions.is(overlayValues)) {
            return overlayValues.map((bin) => bin.binLabel);
          } else {
            return overlayValues;
          }
        },
        getOverlayVariableHelp: () => overlayHelp,
        getEntitySubtitleForViz: () =>
          selectedMarkers && selectedMarkers.length > 0
            ? EntitySubtitleForViz({ subtitle: 'for selected markers' })
            : EntitySubtitleForViz({ subtitle: 'for all visible data on map' }),
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
            overlayConfig: OverlayConfig | BubbleOverlayConfig | undefined;
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
      configurationComponent: ZeroConfiguration,
      isConfigurationComplete: t.undefined.is,
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
          // activate timeline Viz
          timeseries: vizWithCustomizedGetRequest(
            vizWithOptions(
              lineplotVisualization
                .withOptions({
                  showMarginalHistogram: true,
                })
                .withSelectorIcon(TimeSeriesSVG)
            ),
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
  }, [overlayHelp, selectedOverlayConfig, selectedMarkers]);
}
