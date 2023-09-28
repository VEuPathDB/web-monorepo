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
import { BipartiteNetworkRequestParams } from '../../../api/DataClient/types';
import {
  BipartiteNetworkData,
  LinkData,
  NodeData,
} from '@veupathdb/components/lib/types/plots/network';
import { twoColorPalette } from '@veupathdb/components/lib/types/plots/addOns';
import { useMemo } from 'react';
import { scaleOrdinal } from 'd3-scale';
import { uniq } from 'lodash';
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
  const { options, updateThumbnail } = props;

  // Fake data
  const data: BipartiteNetworkData = useMemo(
    () => genBipartiteNetwork(100, 10),
    []
  );

  // Assign color to links.
  // Color palettes live here in the frontend, but the backend knows that the edges should be two colors.
  // So we'll make it generalizable by mapping the values of the links.color prop to the palette.
  const uniqueLinkColors = uniq(
    data.links.map((link) => link.color ?? DEFAULT_LINK_COLOR_DATA)
  );
  const linkColorScale = scaleOrdinal<string>()
    .domain(uniqueLinkColors)
    .range(twoColorPalette); // the output palette may change if this visualization is reused in other contexts.
  const cleanedData: BipartiteNetworkData = {
    ...data,
    links: data.links.map((link) => {
      return {
        ...link,
        color: linkColorScale(link.color ?? DEFAULT_LINK_COLOR_DATA),
      };
    }),
  };

  const plotRef = useUpdateThumbnailEffect(
    updateThumbnail,
    plotContainerStyles,
    [cleanedData]
  );

  const bipartiteNetworkProps: BipartiteNetworkProps = {
    data: cleanedData,
  };

  //@ts-ignore
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
      color: Math.random() > 0.5 ? '0' : '1',
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
