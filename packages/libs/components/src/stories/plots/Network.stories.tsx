import VolcanoPlot, { VolcanoPlotProps } from '../../plots/VolcanoPlot';
import { Story, Meta } from '@storybook/react/types-6-0';
import { Graph, DefaultNode } from '@visx/network';
import { Text } from '@visx/text';
import { Node, Link, NetworkData } from '../../types/plots/network';
import { NodeWithLabel } from '../../plots/Network';

export default {
  title: 'Plots/Network',
  component: VolcanoPlot,
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
        linkComponent={({ link: { source, target } }) => (
          <line
            x1={source.x}
            y1={source.y}
            x2={target.x}
            y2={target.y}
            strokeWidth={2}
            stroke={'#faa'}
            onClick={() => console.log('click link')}
          />
        )}
        // The node components are already transformed using x and y.
        // So inside the node component all coords should be relative to this
        // initial transform.
        nodeComponent={({ node: { x, y, id } }) => {
          const nodeWithLabelProps = {
            node: { x, y, id },
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

// Make bipartite network from number of nodes in each column
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
