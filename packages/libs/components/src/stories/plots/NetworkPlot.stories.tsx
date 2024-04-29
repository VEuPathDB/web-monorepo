import { Story, Meta } from '@storybook/react/types-6-0';
import { NodeData, LinkData, NetworkPlotData } from '../../types/plots/network';
import NetworkPlot from '../../plots/NetworkPlot';
import { ReactNode } from 'react';
import { Text } from '@visx/text';

export default {
  title: 'Plots/Network',
  component: NetworkPlot,
} as Meta;

// For simplicity, make square svgs with the following height and width
const DEFAULT_PLOT_SIZE = 500;

interface TemplateProps {
  data: NetworkPlotData;
  annotations?: ReactNode[];
}

// This template is a simple network that highlights our NodeWithLabel and Link components.
const Template: Story<TemplateProps> = (args) => {
  return (
    <NetworkPlot
      {...args.data}
      annotations={args.annotations}
      containerStyles={{ width: DEFAULT_PLOT_SIZE }}
    />
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

// A network with annotations
const annotation1 = (
  <Text x={30} y={50} fontWeight={600} fill={'orange'}>
    I am an annotation
  </Text>
);
const annotation2 = (
  <Text x={300} y={50} fontWeight={600} fill={'blue'}>
    I am another annotation
  </Text>
);
export const WithAnnotations = Template.bind({});
WithAnnotations.args = {
  data: simpleData,
  annotations: [annotation1, annotation2],
};

// Gerenate a network with a given number of nodes and random edges
function genNetwork(
  nNodes: number,
  addNodeLabel: boolean,
  height: number,
  width: number
) {
  // Create nodes with random positioning, an id, and optionally a label
  const nodes: NodeData[] = [...Array(nNodes).keys()].map((i) => {
    const nodeX = 10 + Math.floor(Math.random() * (width - 20)); // Add/Subtract a bit to keep the whole node in view
    const nodeY = 10 + Math.floor(Math.random() * (height - 20));
    return {
      x: nodeX,
      y: nodeY,
      id: String(i),
      label: addNodeLabel ? 'Node ' + String(i) : undefined,
      labelPosition: addNodeLabel
        ? nodeX > width / 2
          ? 'left'
          : 'right'
        : undefined,
    };
  });

  // Create {nNodes} links. Just basic links no weighting or colors for now.
  const links: LinkData[] = [...Array(nNodes).keys()].map(() => {
    return {
      source: nodes[Math.floor(Math.random() * nNodes)],
      target: nodes[Math.floor(Math.random() * nNodes)],
    };
  });

  return { nodes, links } as NetworkPlotData;
}
