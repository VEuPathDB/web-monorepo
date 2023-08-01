import VolcanoPlot, { VolcanoPlotProps } from '../../plots/VolcanoPlot';
import { Story, Meta } from '@storybook/react/types-6-0';
import { Graph, DefaultNode } from '@visx/network';
import { Text } from '@visx/text';
import { Node, Link, NetworkData } from '../../types/plots/network';
import { NodeWithLabel } from '../../plots/Network';
import { Group } from '@visx/group';

export default {
  title: 'Plots/Network',
  component: NodeWithLabel,
} as Meta;

interface TemplateProps {
  data: Node;
  labelPosition?: 'right' | 'left';
}

const Template: Story<TemplateProps> = (args) => {
  const { data, labelPosition } = args;

  const nodeWithLabelProps = {
    node: data,
    onClick: () => 'i was clicked!', // still not sure about this prop
    labelPosition: labelPosition,
  };

  return (
    <svg width={400} height={400}>
      <Group transform={'translate(' + data.x + ', ' + data.y + ')'}>
        <NodeWithLabel {...nodeWithLabelProps} />
      </Group>
    </svg>
  );
};

/**
 * Stories
 */

// Proof of concept
const myNode = {
  x: 100,
  y: 100,
  id: 'id',
  r: 6,
};

export const NodeWithALabel = Template.bind({});
NodeWithALabel.args = {
  data: myNode,
  labelPosition: 'left',
};

const myFancyNode = {
  x: 100,
  y: 100,
  id: 'id',
  label: 'a fancy long label',
  r: 9,
  color: '#118899',
  strokeColor: '#000',
  strokeWidth: 3,
};

export const FancyNodeWithLabel = Template.bind({});
FancyNodeWithLabel.args = {
  data: myFancyNode,
  labelPosition: 'right',
};
