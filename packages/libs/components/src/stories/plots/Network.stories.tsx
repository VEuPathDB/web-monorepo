import { Story, Meta } from '@storybook/react/types-6-0';
import { Graph } from '@visx/network';
import { NetworkNode, NetworkLink, Network } from '../../types/plots/network';
import { Link, NodeWithLabel } from '../../plots/Network';

export default {
  title: 'Plots/Network',
  component: NodeWithLabel,
} as Meta;

// For simplicity, make square svgs with the following height and width
const DEFAULT_PLOT_SIZE = 500;

interface TemplateProps {
  data: Network;
}

// This template is a simple network that highlights our NodeWithLabel and Link components.
const Template: Story<TemplateProps> = (args) => {
  return (
    <svg width={DEFAULT_PLOT_SIZE} height={DEFAULT_PLOT_SIZE}>
      <Graph
        graph={args.data}
        // Our Link component has nice defaults and in the future can
        // carry more complex events.
        linkComponent={({ link }) => <Link link={link} />}
        // The node components are already transformed using x and y.
        // So inside the node component all coords should be relative to this
        // initial transform.
        nodeComponent={({ node }) => {
          const nodeWithLabelProps = {
            node: node,
          };
          return <NodeWithLabel {...nodeWithLabelProps} />;
        }}
      />
    </svg>
  );
};

/**
 * Stories
 */

// A simple network with node labels
const simpleData = genNetwork(20, true, DEFAULT_PLOT_SIZE, DEFAULT_PLOT_SIZE);
export const Simple = Template.bind({});
Simple.args = {
  data: simpleData,
};

// A network with lots and lots of points!
const manyPointsData = genNetwork(
  100,
  false,
  DEFAULT_PLOT_SIZE,
  DEFAULT_PLOT_SIZE
);
export const ManyPoints = Template.bind({});
ManyPoints.args = {
  data: manyPointsData,
};

// Gerenate a network with a given number of nodes and random edges
function genNetwork(
  nNodes: number,
  addNodeLabel: boolean,
  height: number,
  width: number
) {
  // Create nodes with random positioning, an id, and optionally a label
  const nodes: NetworkNode[] = [...Array(nNodes).keys()].map((i) => {
    return {
      x: Math.floor(Math.random() * width),
      y: Math.floor(Math.random() * height),
      id: String(i),
      label: addNodeLabel ? 'Node ' + String(i) : undefined,
    };
  });

  // Create {nNodes} links. Just basic links no weighting or colors for now.
  const links: NetworkLink[] = [...Array(nNodes).keys()].map(() => {
    return {
      source: nodes[Math.floor(Math.random() * nNodes)],
      target: nodes[Math.floor(Math.random() * nNodes)],
    };
  });

  return { nodes, links } as Network;
}
