import { Story, Meta } from '@storybook/react/types-6-0';
import { Graph } from '@visx/network';
import { Node, NetworkData } from '../../types/plots/network';
import { Link, NodeWithLabel } from '../../plots/Network';

export default {
  title: 'Plots/Network',
  component: NodeWithLabel,
} as Meta;

interface TemplateProps {
  data: NetworkData;
}

const Template: Story<TemplateProps> = (args) => {
  const { data } = args;

  return (
    <svg width={500} height={500}>
      <Graph
        graph={data}
        // Our Link component has nice defaults and in the future can
        // carry more complex events.
        linkComponent={({ link }) => <Link link={link} />}
        // The node components are already transformed using x and y.
        // So inside the node component all coords should be relative to this
        // initial transform.
        nodeComponent={({ node }) => {
          const nodeWithLabelProps = {
            node: node,
            onClick: () => console.log('clicked node'),
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

// Proof of concept
const simpleData = genNetwork(20);
export const Simple = Template.bind({});
Simple.args = {
  data: simpleData,
};

const manyPointsData = genNetwork(30);
export const ManyPoints = Template.bind({});
ManyPoints.args = {
  data: manyPointsData,
};

// Gerenate a network with a given number of nodes and random edges
function genNetwork(nNodes: number) {
  const nodes = [...Array(nNodes).keys()].map((i) => {
    return {
      x: Math.floor(Math.random() * 500),
      y: 15 + 20 * i,
      id: String(i),
    } as Node;
  });

  const links = [...Array(nodes.length).keys()].map(() => {
    return {
      source: nodes[Math.floor(Math.random() * nNodes)],
      target: nodes[Math.floor(Math.random() * nNodes)],
    };
  });

  return { nodes, links } as NetworkData;
}
