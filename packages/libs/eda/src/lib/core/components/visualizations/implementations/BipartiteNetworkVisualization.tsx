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

const DEFAULT_SIG_THRESHOLD = 0.05;
const DEFAULT_FC_THRESHOLD = 2;
const DEFAULT_MARKER_OPACITY = 0.8;
/**
 * The padding ensures we don't clip off part of the glyphs that represent the most extreme points.
 * We could have also used d3.scale.nice but then we dont have precise control of where the extremes
 * are, which is important for user-defined ranges and truncation bars.
 */
const AXIS_PADDING_FACTOR = 0.05;
const EMPTY_VIZ_AXIS_RANGES = {
  independentAxisRange: { min: -9, max: 9 },
  dependentAxisRange: { min: -1, max: 9 },
};

const plotContainerStyles = {
  width: 750,
  height: 450,
  marginLeft: '0.75rem',
  border: '1px solid #dedede',
  boxShadow: '1px 1px 4px #00000066',
};

export const bipartiteNetworkVisualization = createVisualizationPlugin({
  selectorIcon: VolcanoSVG,
  fullscreenComponent: VolcanoPlotViz,
  createDefaultConfig: createDefaultConfig,
});

function createDefaultConfig(): VolcanoPlotConfig {
  return {
    log2FoldChangeThreshold: DEFAULT_FC_THRESHOLD,
    significanceThreshold: DEFAULT_SIG_THRESHOLD,
    markerBodyOpacity: DEFAULT_MARKER_OPACITY,
    independentAxisRange: undefined,
    dependentAxisRange: undefined,
  };
}

export type VolcanoPlotConfig = t.TypeOf<typeof VolcanoPlotConfig>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const VolcanoPlotConfig = t.partial({
  log2FoldChangeThreshold: t.number,
  significanceThreshold: t.number,
  markerBodyOpacity: t.number,
  independentAxisRange: NumberRange,
  dependentAxisRange: NumberRange,
});

interface Options
  extends LayoutOptions,
    RequestOptions<VolcanoPlotConfig, {}, VolcanoPlotRequestParams> {}

// Volcano Plot Visualization
// The volcano plot visualization takes no input variables. The received data populates all parts of the plot.
// The user can control the threshold lines, which affect the marker colors. Additional controls
// include axis ranges and marker opacity slider.
function VolcanoPlotViz(props: VisualizationProps<Options>) {
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
    VolcanoPlotConfig,
    createDefaultConfig,
    updateConfiguration
  );

  // Fake data
  const data: BipartiteNetworkData = genBipartiteNetwork(100, 10);

  const bipartiteNetworkProps: BipartiteNetworkProps = {
    /**
     * VolcanoPlot defines an EmptyVolcanoPlotData variable that will be assigned when data is undefined.
     * In order to display an empty viz, EmptyVolcanoPlotData is defined as:
     *    const EmptyVolcanoPlotData: VolcanoPlotData = [{log2foldChange: '0', pValue: '1'}];
     */
    data: data,
  };

  // @ts-ignore
  const plotNode = <BipartiteNetwork {...bipartiteNetworkProps} />;

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

// Gerenate a bipartite network with a given number of nodes and random edges
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
