import VolcanoPlot, { VolcanoPlotProps } from '../../plots/VolcanoPlot';
import { Story, Meta } from '@storybook/react/types-6-0';
import { range } from 'lodash';
import { NumberRange } from '../../types/general';
import { Graph, DefaultLink, DefaultNode } from '@visx/network';
import { Label } from '@visx/annotation';
import { Text } from '@visx/text';

export default {
  title: 'Plots/BipartiteNetwork',
  component: VolcanoPlot,
} as Meta;

interface TemplateProps {
  nNodesColumn1: number;
  nNodesColumn2: number;
}

const Template: Story<TemplateProps> = (args) => {
  const nodesCol1 = [...Array(args.nNodesColumn1).keys()].map((i) => {
    return {
      x: 100,
      y: 15 + 20 * i,
    };
  });

  const nodesCol2 = [...Array(args.nNodesColumn2).keys()].map((i) => {
    return {
      x: 300,
      y: 15 + 20 * i,
    };
  });

  const nodes = nodesCol1.concat(nodesCol2);

  const links = [...Array(nodes.length).keys()].map(() => {
    return {
      source: nodes[Math.floor(Math.random() * args.nNodesColumn1)],
      target:
        nodes[
          args.nNodesColumn1 + Math.floor(Math.random() * args.nNodesColumn2)
        ],
    };
  });

  const dataSample = {
    nodes,
    links,
  };

  return (
    <svg width={500} height={nodes.length * 20 + 50}>
      <Graph
        graph={dataSample}
        linkComponent={({ link: { source, target } }) => (
          <line
            x1={source.x}
            y1={source.y}
            x2={target.x}
            y2={target.y}
            strokeWidth={Math.random() * 2}
            stroke={Math.random() > 0.5 ? '#adf' : '#faa'}
            strokeOpacity={Math.random()}
            onClick={() => console.log('click link')}
          />
        )}
        nodeComponent={() => (
          <DefaultNode
            r={4}
            fill="#aaa"
            onClick={() => console.log('click node')}
          />
        )}
      />
      {nodes.map((node, ind) => {
        // Why is this text part so slow? The nodes and links are fast but text is slow
        return (
          <Text
            x={ind < args.nNodesColumn1 ? node.x - 6 : node.x + 6}
            y={node.y}
            textAnchor={ind < args.nNodesColumn1 ? 'end' : 'start'}
            fontSize="0.8em"
            verticalAnchor="middle"
          >
            Label
          </Text>
        );
      })}
    </svg>
  );
};

/**
 * Stories
 */

// A small volcano plot. Proof of concept
export const Simple = Template.bind({});
Simple.args = {
  nNodesColumn1: 20,
  nNodesColumn2: 10,
};

// Most volcano plots will have thousands of points, since each point
// represents a gene or taxa. Make a volcano plot with
// a lot of points.
export const ManyPoints = Template.bind({});
ManyPoints.args = {
  nNodesColumn1: 5000,
  nNodesColumn2: 1000,
};

// Add story for truncation
// export const Truncation = Template.bind({})
// Truncation.args = {
//   data: dataSetVolcano,
//   independentAxisRange: []
// }
