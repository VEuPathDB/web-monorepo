// load scatter plot component
import VolcanoPlot, {
  VolcanoPlotProps,
  assignSignificanceColor,
  RawDataMinMaxValues,
} from '@veupathdb/components/lib/plots/VolcanoPlot';
import {
  BipartiteNetwork,
  BipartiteNetworkProps,
} from '@veupathdb/components/lib/plots/BipartiteNetwork';

import * as t from 'io-ts';
import { useCallback, useMemo } from 'react';

import { usePromise } from '../../../hooks/promise';
import { useUpdateThumbnailEffect } from '../../../hooks/thumbnails';
import {
  useDataClient,
  useStudyEntities,
  useStudyMetadata,
} from '../../../hooks/workspace';
import { PlotLayout } from '../../layouts/PlotLayout';

import { VisualizationProps } from '../VisualizationTypes';

// concerning axis range control
import { useVizConfig } from '../../../hooks/visualizations';
import { createVisualizationPlugin } from '../VisualizationPlugin';

import { LayoutOptions } from '../../layouts/types';
import { RequestOptions } from '../options/types';

// Bipartite network imports
import VolcanoSVG from './selectorIcons/VolcanoSVG';
import { DifferentialAbundanceConfig } from '../../computations/plugins/differentialabundance';
import { NumberRange } from '../../../types/general';
import { VolcanoPlotRequestParams } from '../../../api/DataClient/types';
import {
  BipartiteNetworkData,
  LinkData,
  NodeData,
} from '@veupathdb/components/lib/types/plots/network';
import DataClient from '../../../api/DataClient';
import { twoColorPalette } from '@veupathdb/components/lib/types/plots/addOns';
// end imports

// Defaults
const DEFAULT_EDGE_THRESHOLD = 0.9;

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
    edgeThreshold: DEFAULT_EDGE_THRESHOLD,
  };
}

export type BipartiteNetworkConfig = t.TypeOf<typeof BipartiteNetworkConfig>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const BipartiteNetworkConfig = t.partial({
  edgeThreshold: t.number,
});

interface Options
  extends LayoutOptions,
    RequestOptions<BipartiteNetworkConfig, {}, VolcanoPlotRequestParams> {}

// Volcano Plot Visualization
// The volcano plot visualization takes no input variables. The received data populates all parts of the plot.
// The user can control the threshold lines, which affect the marker colors. Additional controls
// include axis ranges and marker opacity slider.
function BipartiteNetworkViz(props: VisualizationProps<Options>) {
  const {
    options,
    computation,
    visualization,
    updateConfiguration,
    updateThumbnail,
    filters,
    filteredCounts,
    computeJobStatus,
  } = props;

  const studyMetadata = useStudyMetadata();
  const { id: studyId } = studyMetadata;
  const entities = useStudyEntities(filters);
  const dataClient: DataClient = useDataClient();
  const computationConfiguration: DifferentialAbundanceConfig = computation
    .descriptor.configuration as DifferentialAbundanceConfig;

  const [vizConfig, updateVizConfig] = useVizConfig(
    visualization.descriptor.configuration,
    BipartiteNetworkConfig,
    createDefaultConfig,
    updateConfiguration
  );

  // Fake data
  const data: BipartiteNetworkData = genBipartiteNetwork(100, 10);

  const plotRef = useUpdateThumbnailEffect(
    updateThumbnail,
    plotContainerStyles,
    [data]
  );

  const bipartiteNetworkProps: BipartiteNetworkProps = {
    data: data,
  };

  // @ts-ignore
  const plotNode = (
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

// TEMP: Gerenate a bipartite network with a given number of nodes and random edges
function genBipartiteNetwork(
  column1nNodes: number,
  column2nNodes: number
): BipartiteNetworkData {
  // Create the first column of nodes
  const column1Nodes: NodeData[] = [...Array(column1nNodes).keys()].map((i) => {
    return {
      id: String(i),
      label: 'Node ' + String(i),
    };
  });

  // Create the second column of nodes
  const column2Nodes: NodeData[] = [...Array(column2nNodes).keys()].map((i) => {
    return {
      id: String(i + column1nNodes),
      label: 'Node ' + String(i + column1nNodes),
    };
  });

  // Create links
  // Not worried about exactly how many edges we're adding just yet since this is
  // used for stories only. Adding color here to mimic what the visualization
  // will do.
  const links: LinkData[] = [...Array(column1nNodes * 2).keys()].map(() => {
    return {
      source: column1Nodes[Math.floor(Math.random() * column1nNodes)],
      target: column2Nodes[Math.floor(Math.random() * column2nNodes)],
      strokeWidth: Math.random() * 2,
      color: Math.random() > 0.5 ? twoColorPalette[0] : twoColorPalette[1],
    };
  });

  const nodes = column1Nodes.concat(column2Nodes);
  const column1NodeIDs = column1Nodes.map((node) => node.id);
  const column2NodeIDs = column2Nodes.map((node) => node.id);

  return {
    nodes,
    links,
    column1NodeIDs,
    column2NodeIDs,
  };
}
