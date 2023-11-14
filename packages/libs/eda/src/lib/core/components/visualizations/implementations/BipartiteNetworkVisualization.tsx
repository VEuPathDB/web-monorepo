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
import { OutputEntityTitle } from '../OutputEntityTitle';
// end imports

// Defaults
const DEFAULT_CORRELATION_COEF_THRESHOLD = 0.05; // Ability for user to change this value not yet implemented.
const DEFAULT_SIGNIFICANCE_THRESHOLD = 0.05; // Ability for user to change this value not yet implemented.
const DEFAULT_LINK_COLOR_DATA = '0';

const plotContainerStyles = {
  width: 750,
  height: 450,
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
  } = props;

  const studyMetadata = useStudyMetadata();
  const { id: studyId } = studyMetadata;
  const entities = useStudyEntities(filters);
  const dataClient: DataClient = useDataClient();
  const computationConfiguration: CorrelationAssayMetadataConfig = computation
    .descriptor.configuration as CorrelationAssayMetadataConfig;

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

  // Assign color to links.
  // Color palettes live here in the frontend, but the backend decides how to color links (ex. by sign of correlation, or avg degree of parent nodes).
  // So we'll make assigning colors generalizable by mapping the values of the links.color prop to the palette.
  const uniqueLinkColors = uniq(
    data.value?.bipartitenetwork.data.links.map(
      (link) => link.color?.toString() ?? DEFAULT_LINK_COLOR_DATA
    )
  );
  if (uniqueLinkColors.length > twoColorPalette.length) {
    throw new Error(
      `Found ${uniqueLinkColors.length} link colors but expected only two.`
    );
  }
  // The link colors should be either '-1' or '1', but we'll allow any two unique values. Assigning the domain
  // this way prevents a situation where if all links have color '1', we don't want them mapped to the
  // color that is usually reserved for '-1'.
  const linkColorScaleDomain = uniqueLinkColors.every((val) =>
    ['-1', '1'].includes(val)
  )
    ? ['-1', '1']
    : uniqueLinkColors;
  const linkColorScale = scaleOrdinal<string>()
    .domain(linkColorScaleDomain)
    .range(twoColorPalette); // the output palette may change if this visualization is reused in other contexts (ex. not a correlation app).

  // Clean and finalize data format. Specifically, assign link colors, add display labels
  const cleanedData = useMemo(() => {
    if (!data.value) return undefined;

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
  }, [data, entities, linkColorScale]);

  // plot subtitle
  const plotSubtitle =
    options?.getPlotSubtitle?.(computation.descriptor.configuration) +
    DEFAULT_CORRELATION_COEF_THRESHOLD.toString();

  const plotRef = useUpdateThumbnailEffect(
    updateThumbnail,
    plotContainerStyles,
    [cleanedData]
  );

  const bipartiteNetworkProps: BipartiteNetworkProps = {
    data: cleanedData ?? undefined,
    showSpinner: data.pending,
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
