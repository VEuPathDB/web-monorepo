import { Story, Meta } from '@storybook/react/types-6-0';
import { Graph } from '@visx/network';
import { NodeData, LinkData, NetworkData } from '../../types/plots/network';
import { Link, NodeWithLabel } from '../../plots/Network';

export default {
  title: 'Plots/Network',
  component: NodeWithLabel,
} as Meta;

interface TemplateProps {
  data: NetworkData;
}

// This template is a simple network that highlights our NodeWithLabel and Link components.
const Template: Story<TemplateProps> = (args) => {
  return (
    <svg width={500} height={500}>
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
const simpleData = genNetwork(20, true);
export const Simple = Template.bind({});
Simple.args = {
  data: simpleData,
};

// A network with lots and lots of points!
const manyPointsData = genNetwork(100, false);
export const ManyPoints = Template.bind({});
ManyPoints.args = {
  data: manyPointsData,
};

// Gerenate a network with a given number of nodes and random edges
function genNetwork(nNodes: number, addNodeLabel: boolean) {
  // Create nodes with random positioning, an id, and optionally a label
  const nodes: NodeData[] = [...Array(nNodes).keys()].map((i) => {
    return {
      x: Math.floor(Math.random() * 500),
      y: Math.floor(Math.random() * 500),
      id: String(i),
      label: addNodeLabel ? 'Node ' + String(i) : undefined,
    };
  });

  // Create {nNodes} links. Just basic links no weighting or colors for now.
  const links: LinkData[] = [...Array(nodes.length).keys()].map(() => {
    return {
      source: nodes[Math.floor(Math.random() * nNodes)],
      target: nodes[Math.floor(Math.random() * nNodes)],
    };
  });

  return { nodes, links } as NetworkData;
}
