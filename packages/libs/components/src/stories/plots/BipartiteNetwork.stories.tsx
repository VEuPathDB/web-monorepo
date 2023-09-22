import { Story, Meta } from '@storybook/react/types-6-0';
import {
  NodeData,
  LinkData,
  BipartiteNetworkData,
} from '../../types/plots/network';
import { LabelPosition, Link, NodeWithLabel } from '../../plots/Network';
import { partition } from 'lodash';
import {
  BipartiteNetwork,
  BipartiteNetworkProps,
} from '../../plots/BipartiteNetwork';

export default {
  title: 'Plots/BipartiteNetwork',
  component: NodeWithLabel,
} as Meta;

// For simplicity, make square svgs with the following height and width
const DEFAULT_PLOT_SIZE = 500;

interface TemplateProps {
  data: BipartiteNetworkData;
}

// This template is a simple network that highlights our NodeWithLabel and Link components.
const Template: Story<TemplateProps> = (args) => {
  const bipartiteNetworkProps: BipartiteNetworkProps = {
    data: args.data,
  };
  return <BipartiteNetwork {...bipartiteNetworkProps} />;
};

/**
 * Stories
 */

// A simple network with node labels
const simpleData = genBipartiteNetwork(
  20,
  10,
  DEFAULT_PLOT_SIZE,
  DEFAULT_PLOT_SIZE
);
export const Simple = Template.bind({});
Simple.args = {
  data: simpleData,
};

// A network with lots and lots of points!
const manyPointsData = genBipartiteNetwork(
  1000,
  100,
  DEFAULT_PLOT_SIZE,
  DEFAULT_PLOT_SIZE
);
export const ManyPoints = Template.bind({});
ManyPoints.args = {
  data: manyPointsData,
};

/** NetworkData is the same format accepted by visx's Graph component. */
// export type NetworkData = {
//   nodes: NodeData[];
//   links: LinkData[];
// };

// /** Bipartite network data is a regular network with addiitonal declarations of
//  * nodes in each of the two columns. IDs in columnXNodeIDs must match node ids exactly.
//  */
// export type BipartiteNetworkData = {
//   column1NodeIDs: string[];
//   column2NodeIDs: string[];
// } & NetworkData;

// Gerenate a network with a given number of nodes and random edges
function genBipartiteNetwork(
  column1nNodes: number,
  column2nNodes: number,
  height: number,
  width: number
) {
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
      label: 'Node ' + String(i),
    };
  });

  // Create links
  // @ANN come back and mmake this more tunable
  const links: LinkData[] = [...Array(column1nNodes * 2).keys()].map(() => {
    return {
      source: column1Nodes[Math.floor(Math.random() * column1nNodes)],
      target: column2Nodes[Math.floor(Math.random() * column2nNodes)],
      strokeWidth: Math.random() * 2,
      color: Math.random() > 0.5 ? 'positive' : 'negative',
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
  } as BipartiteNetworkData;
}
