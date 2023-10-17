import * as t from 'io-ts';
import { useUpdateThumbnailEffect } from '../../../hooks/thumbnails';
import { PlotLayout } from '../../layouts/PlotLayout';
import { VisualizationProps } from '../VisualizationTypes';
import { createVisualizationPlugin } from '../VisualizationPlugin';
import { LayoutOptions } from '../../layouts/types';
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
import {
  BipartiteNetworkData,
  LinkData,
  NodeData,
} from '@veupathdb/components/lib/types/plots/network';
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
import DataClient from '../../../api/DataClient';
import { CorrelationAssayMetadataConfig } from '../../computations/plugins/correlationAssayMetadata';
// end imports

// Defaults
const DEFAULT_CORRELATION_COEF_THRESHOLD = 0.9;
const DEFAULT_SIGNIFICANCE_THRESHOLD = 0.05;
const DEFAULT_LINK_COLOR_DATA = '0';

const plotContainerStyles = {
  width: 750,
  height: 450,
  marginLeft: '0.75rem',
  border: '1px solid #dedede',
  boxShadow: '1px 1px 4px #00000066',
};

export const bipartiteNetworkVisualization = createVisualizationPlugin({
  selectorIcon: VolcanoSVG, // TEMP
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
    RequestOptions<BipartiteNetworkConfig, {}, BipartiteNetworkRequestParams> {}

// Bipartite Network Visualization
// The bipartite network takes no input variables, because the received data will complete the plot.
// Eventually the user will be able to control the significance and correlation coefficient values.
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

  // Fake data
  const data = usePromise(
    useCallback(async (): Promise<BipartiteNetworkResponse | undefined> => {
      // Only need to check compute job status and filter status, since there are no
      // viz input variables.
      console.log(filteredCounts);
      if (computeJobStatus !== 'complete') return undefined;
      if (filteredCounts.pending || filteredCounts.value == null)
        return undefined;

      // There are _no_ viz request params for the volcano plot (config: {}).
      // The data service streams the volcano data directly from the compute service.
      const params = {
        studyId,
        filters,
        config: {},
        computeConfig: computationConfiguration,
      };
      console.log(params);

      const response = await dataClient.getVisualizationData(
        computation.descriptor.type,
        visualization.descriptor.type,
        params,
        BipartiteNetworkResponse
      );
      console.log('new response');
      console.log(response);

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

  console.log(data);

  // Assign color to links.
  // Color palettes live here in the frontend, but the backend knows that the edges should be two colors.
  // So we'll make it generalizable by mapping the values of the links.color prop to the palette.
  const uniqueLinkColors = uniq(
    data.value?.links.map(
      (link) => link.linkColor.toString() ?? DEFAULT_LINK_COLOR_DATA
    )
  );
  const linkColorScale = scaleOrdinal<string>()
    .domain(uniqueLinkColors)
    .range(twoColorPalette); // the output palette may change if this visualization is reused in other contexts.

  const cleanedData = useMemo(() => {
    if (!data.value) return undefined;
    return {
      ...data.value,
      links: data.value.links.map((link) => {
        return {
          ...link,
          color: linkColorScale(
            link.linkColor.toString() ?? DEFAULT_LINK_COLOR_DATA
          ),
        };
      }),
    };
  }, [data]);

  const plotRef = useUpdateThumbnailEffect(
    updateThumbnail,
    plotContainerStyles,
    [cleanedData]
  );

  console.log(cleanedData);

  const bipartiteNetworkProps: BipartiteNetworkProps = {
    data: cleanedData ?? undefined,
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
