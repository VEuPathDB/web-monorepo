import * as t from 'io-ts';
import { useUpdateThumbnailEffect } from '../../../hooks/thumbnails';
import { PlotLayout } from '../../layouts/PlotLayout';
import { VisualizationProps } from '../VisualizationTypes';
import { createVisualizationPlugin } from '../VisualizationPlugin';
import { LayoutOptions, TitleOptions } from '../../layouts/types';
import { RequestOptions } from '../options/types';

// Bipartite network imports
import BipartiteNetwork, {
  BipartiteNetworkProps,
} from '@veupathdb/components/lib/plots/BipartiteNetwork';
import VolcanoSVG from './selectorIcons/VolcanoSVG'; // TEMP
import {
  BipartiteNetworkRequestParams,
  BipartiteNetworkResponse,
} from '../../../api/DataClient/types';
import { twoColorPalette } from '@veupathdb/components/lib/types/plots/addOns';
import { useCallback, useMemo } from 'react';
import { scaleOrdinal } from 'd3-scale';
import { uniq } from 'lodash';
import { usePromise } from '../../../hooks/promise';
import {
  useDataClient,
  useStudyEntities,
  useStudyMetadata,
} from '../../../hooks/workspace';
import { fixVarIdLabel } from '../../../utils/visualization';
import DataClient from '../../../api/DataClient';
import { CorrelationAssayMetadataConfig } from '../../computations/plugins/correlationAssayMetadata';
import { CorrelationAssayAssayConfig } from '../../computations/plugins/correlationAssayAssay';
import { OutputEntityTitle } from '../OutputEntityTitle';
// end imports

// Defaults
const DEFAULT_CORRELATION_COEF_THRESHOLD = 0.5; // Ability for user to change this value not yet implemented.
const DEFAULT_SIGNIFICANCE_THRESHOLD = 0.05; // Ability for user to change this value not yet implemented.
const DEFAULT_LINK_COLOR_DATA = '0';

const plotContainerStyles = {
  width: 750,
  marginLeft: '0.75rem',
  border: '1px solid #dedede',
  boxShadow: '1px 1px 4px #00000066',
};

export const bipartiteNetworkVisualization = createVisualizationPlugin({
  selectorIcon: VolcanoSVG, // TEMPORARY
  fullscreenComponent: BipartiteNetworkViz,
  createDefaultConfig: createDefaultConfig,
});

function createDefaultConfig(): BipartiteNetworkConfig {
  return {
    correlationCoefThreshold: DEFAULT_CORRELATION_COEF_THRESHOLD,
    significanceThreshold: DEFAULT_SIGNIFICANCE_THRESHOLD,
  };
}

export type BipartiteNetworkConfig = t.TypeOf<typeof BipartiteNetworkConfig>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const BipartiteNetworkConfig = t.partial({
  correlationCoefThreshold: t.number,
  significanceThreshold: t.number,
});

interface Options
  extends LayoutOptions,
    TitleOptions,
    RequestOptions<BipartiteNetworkConfig, {}, BipartiteNetworkRequestParams> {}

// Bipartite Network Visualization
// The bipartite network takes no input variables, because the received data will complete the plot.
// Eventually the user will be able to control the significance and correlation coefficient threshold values.
function BipartiteNetworkViz(props: VisualizationProps<Options>) {
  const {
    options,
    computation,
    visualization,
    updateThumbnail,
    computeJobStatus,
    filteredCounts,
    filters,
    plotContainerStyleOverrides,
  } = props;

  const studyMetadata = useStudyMetadata();
  const { id: studyId } = studyMetadata;
  const entities = useStudyEntities(filters);
  const dataClient: DataClient = useDataClient();
  // todo  allow this to also be CorrelationAssayAssayConfig
  const computationConfiguration:
    | CorrelationAssayMetadataConfig
    | CorrelationAssayAssayConfig = computation.descriptor.configuration as
    | CorrelationAssayMetadataConfig
    | CorrelationAssayAssayConfig;

  // Get data from the compute job
  const data = usePromise(
    useCallback(async (): Promise<BipartiteNetworkResponse | undefined> => {
      // Only need to check compute job status and filter status, since there are no
      // viz input variables.
      if (computeJobStatus !== 'complete') return undefined;
      if (filteredCounts.pending || filteredCounts.value == null)
        return undefined;

      const params = {
        studyId,
        filters,
        config: {
          correlationCoefThreshold: DEFAULT_CORRELATION_COEF_THRESHOLD,
          significanceThreshold: DEFAULT_SIGNIFICANCE_THRESHOLD,
        },
        computeConfig: computationConfiguration,
      };

      const response = await dataClient.getVisualizationData(
        computation.descriptor.type,
        visualization.descriptor.type,
        params,
        BipartiteNetworkResponse
      );

      return response;
    }, [
      computeJobStatus,
      filteredCounts.pending,
      filteredCounts.value,
      filters,
      studyId,
      computationConfiguration,
      computation.descriptor.type,
      dataClient,
      visualization.descriptor.type,
    ])
  );

  // Clean and finalize data format. Specifically, assign link colors, add display labels
  const cleanedData = useMemo(() => {
    if (!data.value) return undefined;

    // Assign color to links.
    // Color palettes live here in the frontend, but the backend decides how to color links (ex. by sign of correlation, or avg degree of parent nodes).
    // So we'll make assigning colors generalizable by mapping the values of the links.color prop to the palette. As we add
    // different ways to color links in the future, we can adapt our checks and error messaging.
    const uniqueLinkColors = uniq(
      data.value?.bipartitenetwork.data.links.map(
        (link) => link.color?.toString() ?? DEFAULT_LINK_COLOR_DATA
      )
    );
    if (uniqueLinkColors.length > twoColorPalette.length) {
      throw new Error(
        `Found ${uniqueLinkColors.length} link colors but expected only ${twoColorPalette.length}.`
      );
    }
    // The link color sent from the backend should be either '-1' or '1', but we'll allow any two unique values. Assigning the domain
    // in the following way preserves "1" getting mapped to the second color in the palette, even if it's the only
    // unique value in uniqueLinkColors.
    const linkColorScaleDomain = uniqueLinkColors.every((val) =>
      ['-1', '1'].includes(val)
    )
      ? ['-1', '1']
      : uniqueLinkColors;
    const linkColorScale = scaleOrdinal<string>()
      .domain(linkColorScaleDomain)
      .range(twoColorPalette); // the output palette may change if this visualization is reused in other contexts (ex. not a correlation app).

    // Find display labels
    const nodesWithLabels = data.value.bipartitenetwork.data.nodes.map(
      (node) => {
        // node.id is the entityId.variableId
        const displayLabel = fixVarIdLabel(
          node.id.split('.')[1],
          node.id.split('.')[0],
          entities
        );

        return {
          id: node.id,
          label: displayLabel,
        };
      }
    );
    return {
      ...data.value.bipartitenetwork.data,
      nodes: nodesWithLabels,
      links: data.value.bipartitenetwork.data.links.map((link) => {
        return {
          source: link.source,
          target: link.target,
          strokeWidth: Number(link.strokeWidth),
          color: link.color ? linkColorScale(link.color.toString()) : '#000000',
        };
      }),
    };
  }, [data.value, entities]);

  // plot subtitle
  const plotSubtitle =
    options?.getPlotSubtitle?.(computation.descriptor.configuration) +
    DEFAULT_CORRELATION_COEF_THRESHOLD.toString() +
    'and a p-value below ' +
    DEFAULT_SIGNIFICANCE_THRESHOLD.toString();

  const finalPlotContainerStyles = useMemo(
    () => ({
      ...plotContainerStyles,
      ...plotContainerStyleOverrides,
    }),
    [plotContainerStyleOverrides]
  );

  // These styles affect the network plot and will override the containerStyles if necessary (for example, width).
  const bipartiteNetworkSVGStyles = {
    columnPadding: 150,
  };

  const plotRef = useUpdateThumbnailEffect(
    updateThumbnail,
    {
      ...finalPlotContainerStyles,
      height: 400, // no reason for the thumbnail to be as tall as the network (which could be very, very tall!)
    },
    [cleanedData]
  );

  const bipartiteNetworkProps: BipartiteNetworkProps = {
    data: cleanedData ?? undefined,
    showSpinner: data.pending,
    containerStyles: finalPlotContainerStyles,
    svgStyleOverrides: bipartiteNetworkSVGStyles,
  };

  const plotNode = (
    //@ts-ignore
    <BipartiteNetwork {...bipartiteNetworkProps} ref={plotRef} />
  );

  const controlsNode = <> </>;
  const legendNode = <> </>;
  const tableGroupNode = <> </>;

  const LayoutComponent = options?.layoutComponent ?? PlotLayout;

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <OutputEntityTitle subtitle={plotSubtitle} />
      <LayoutComponent
        isFaceted={false}
        legendNode={legendNode}
        plotNode={plotNode}
        controlsNode={controlsNode}
        tableGroupNode={tableGroupNode}
        showRequiredInputsPrompt={false}
      />
    </div>
  );
}
