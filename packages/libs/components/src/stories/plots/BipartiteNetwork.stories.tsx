import { Story, Meta } from '@storybook/react/types-6-0';
import {
  NodeData,
  LinkData,
  BipartiteNetworkData,
} from '../../types/plots/network';
import {
  BipartiteNetwork,
  BipartiteNetworkProps,
} from '../../plots/BipartiteNetwork';
import { twoColorPalette } from '../../types/plots';

export default {
  title: 'Plots/Network/BipartiteNetwork',
  component: BipartiteNetwork,
} as Meta;

// For simplicity, make square svgs with the following height and width
const DEFAULT_PLOT_SIZE = 500;

interface TemplateProps {
  data: BipartiteNetworkData;
  column1Name?: string;
  column2Name?: string;
  loading?: boolean;
}

// This template is a simple network that highlights our BipartiteNetwork component.
const Template: Story<TemplateProps> = (args) => {
  const bipartiteNetworkProps: BipartiteNetworkProps = {
    data: args.data,
    column1Name: args.column1Name,
    column2Name: args.column2Name,
    showSpinner: args.loading,
  };
  return <BipartiteNetwork {...bipartiteNetworkProps} />;
};

/**
 * Stories
 */

// A simple network with node labels
const simpleData = genBipartiteNetwork(20, 10);
export const Simple = Template.bind({});
Simple.args = {
  data: simpleData,
};

// A network with lots and lots of points!
const manyPointsData = genBipartiteNetwork(1000, 100);
export const ManyPoints = Template.bind({});
ManyPoints.args = {
  data: manyPointsData,
};

// With column names
export const WithColumnNames = Template.bind({});
WithColumnNames.args = {
  data: simpleData,
  column1Name: 'Column 1',
  column2Name: 'Column 2',
};

// Loading with a spinner
export const Loading = Template.bind({});
Loading.args = {
  data: simpleData,
  column1Name: 'Column 1',
  column2Name: 'Column 2',
  loading: true,
};

// Gerenate a network with a given number of nodes and random edges
function genBipartiteNetwork(column1nNodes: number, column2nNodes: number) {
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
  // @ANN come back and mmake this more tunable
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
  } as BipartiteNetworkData;
}
