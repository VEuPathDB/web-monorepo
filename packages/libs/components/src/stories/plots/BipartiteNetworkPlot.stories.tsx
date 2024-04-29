import { useState, useEffect, useRef, CSSProperties, ReactNode } from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';
import {
  NodeData,
  LinkData,
  BipartiteNetworkData,
  NetworkPartition,
} from '../../types/plots/network';
import BipartiteNetworkPlot, {
  BipartiteNetworkProps,
  BipartiteNetworkSVGStyles,
} from '../../plots/BipartiteNetworkPlot';
import { twoColorPalette } from '../../types/plots/addOns';
import { Text } from '@visx/text';
import { NodeMenuAction } from '../../plots/NetworkPlot';

export default {
  title: 'Plots/Network/BipartiteNetwork',
  component: BipartiteNetworkPlot,
} as Meta;

interface TemplateProps {
  data: BipartiteNetworkData;
  partitions: NetworkPartition[];
  showSpinner?: boolean;
  showThumbnail?: boolean;
  containerStyles?: CSSProperties;
  svgStyleOverrides?: BipartiteNetworkSVGStyles;
  labelTruncationLength?: number;
  emptyNetworkContent?: ReactNode;
  getNodeMenuActions?: BipartiteNetworkProps['getNodeMenuActions'];
  isSelectable?: boolean;
}

// Template for showcasing our BipartiteNetwork component.
const Template: Story<TemplateProps> = (args) => {
  // Generate a jpeg version of the network (svg).
  // Mimicks the makePlotThumbnailUrl process in web-eda.
  const ref = useRef<any>(null);
  const [img, setImg] = useState('');
  useEffect(() => {
    setTimeout(() => {
      ref.current
        ?.toImage({ format: 'jpeg', height: 400, width: 600 })
        .then((src: string) => setImg(src));
    }, 2000);
  }, []);

  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);

  const bipartiteNetworkProps: BipartiteNetworkProps = {
    nodes: args.data && args.data.nodes,
    links: args.data && args.data.links,
    partitions: args.data && args.data.partitions,
    showSpinner: args.showSpinner,
    containerStyles: args.containerStyles,
    svgStyleOverrides: args.svgStyleOverrides,
    labelTruncationLength: args.labelTruncationLength,
    emptyNetworkContent: args.emptyNetworkContent,
    getNodeMenuActions: args.getNodeMenuActions,
    ...(args.isSelectable
      ? {
          selectedNodeIds,
          setSelectedNodeIds,
        }
      : {}),
  };
  return (
    <>
      <BipartiteNetworkPlot ref={ref} {...bipartiteNetworkProps} />
      {args.showThumbnail && (
        <>
          <br></br>
          <h3>A snapshot of the plot will appear below after two sconds...</h3>
          <img src={img} alt="Bipartite network snapshot" />
        </>
      )}
    </>
  );
};

/**
 * Stories
 */

// A basic bipartite network
const simpleData = genBipartiteNetwork(20, 10, false);
export const Simple = Template.bind({});
Simple.args = {
  data: simpleData,
};

// A network with lots and lots of points!
const manyPointsData = genBipartiteNetwork(1000, 100, false);
export const ManyPoints = Template.bind({});
ManyPoints.args = {
  data: manyPointsData,
};

// With partition names
const simpleDataWithNames = genBipartiteNetwork(20, 10, true);
export const WithPartitionNames = Template.bind({});
WithPartitionNames.args = {
  data: simpleDataWithNames,
};

// Loading with a spinner
export const Loading = Template.bind({});
Loading.args = {
  data: simpleDataWithNames,
  showSpinner: true,
};

// Empty bipartite network
export const Empty = Template.bind({});
Empty.args = {
  data: undefined,
};

// Show thumbnail
export const Thumbnail = Template.bind({});
Thumbnail.args = {
  data: genBipartiteNetwork(10, 10, true),
  showThumbnail: true,
};

// With style
const plotContainerStyles = {
  width: 700,
  marginLeft: '0.75rem',
  border: '1px solid #dedede',
  boxShadow: '1px 1px 4px #00000066',
};
const svgStyleOverrides = {
  columnPadding: 150,
  topPadding: 100,
  // width: 300, // should override the plotContainerStyles.width
};
export const WithStyle = Template.bind({});
WithStyle.args = {
  data: manyPointsData,
  containerStyles: plotContainerStyles,
  svgStyleOverrides: svgStyleOverrides,
  labelTruncationLength: 5,
};

function getNodeActions(nodeId: string): NodeMenuAction[] {
  return [
    {
      label: 'Click me!!',
      onClick() {
        alert('You clicked node ' + nodeId);
      },
    },
    {
      label: 'Click me, too!!',
      onClick() {
        alert('You clicked node ' + nodeId);
      },
    },
  ];
}

export const WithActions = Template.bind({});
WithActions.args = {
  data: simpleData,
  containerStyles: {
    marginLeft: '200px',
  },
  getNodeMenuActions: getNodeActions,
  isSelectable: false,
};

export const WithSelection = Template.bind({});
WithSelection.args = {
  data: simpleData,
  containerStyles: {
    marginLeft: '200px',
  },
  getNodeMenuActions: getNodeActions,
  isSelectable: true,
};

// With a network that has no nodes or links
const noNodesData = genBipartiteNetwork(0, 0, false);
const emptyNetworkContent = (
  <Text x={100} y={100}>
    No nodes or links
  </Text>
);
export const NoNodes = Template.bind({});
NoNodes.args = {
  data: noNodesData,
  emptyNetworkContent,
};

// Gerenate a bipartite network with a given number of nodes and random edges
function genBipartiteNetwork(
  partition1nNodes: number,
  partition2nNodes: number,
  addPartitionNames: boolean
): BipartiteNetworkData {
  // Create the first partition of nodes
  const partition1Nodes: NodeData[] = [...Array(partition1nNodes).keys()].map(
    (i) => {
      return {
        id: String(i),
        label: 'Node ' + String(i),
      };
    }
  );

  // Create the second partition of nodes
  const partition2Nodes: NodeData[] = [...Array(partition2nNodes).keys()].map(
    (i) => {
      return {
        id: String(i + partition1nNodes),
        label: 'Node ' + String(i + partition1nNodes),
      };
    }
  );

  // Create links
  // Not worried about exactly how many edges we're adding just yet since this is
  // used for stories only. Adding color here to mimic what the visualization
  // will do.
  const links: LinkData[] = [...Array(partition1nNodes * 2).keys()].map(() => {
    return {
      source: partition1Nodes[Math.floor(Math.random() * partition1nNodes)],
      target: partition2Nodes[Math.floor(Math.random() * partition2nNodes)],
      strokeWidth: Math.random() * 2,
      color: Math.random() > 0.5 ? twoColorPalette[0] : twoColorPalette[1],
    };
  });

  const nodes = partition1Nodes.concat(partition2Nodes);
  const partition1NodeIDs = partition1Nodes.map((node) => node.id);
  const partition2NodeIDs = partition2Nodes.map((node) => node.id);

  return {
    nodes,
    links,
    partitions: [
      {
        nodeIds: partition1NodeIDs,
        name: addPartitionNames ? 'Partition 1' : undefined,
      },
      {
        nodeIds: partition2NodeIDs,
        name: addPartitionNames ? 'Partition 2' : undefined,
      },
    ],
  };
}
