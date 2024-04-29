import { Story, Meta } from '@storybook/react/types-6-0';
import { NodeData } from '../../types/plots/network';
import { NodeWithLabel } from '../../plots/Node';
import { Group } from '@visx/group';

export default {
  title: 'Plots/Network/NodeWithLabel',
  component: NodeWithLabel,
} as Meta;

interface TemplateProps {
  data: NodeData;
  onClick: () => void;
  labelPosition?: 'right' | 'left';
  fontWeight?: number;
  labelColor?: string;
}

// Simply draw a node!
const Template: Story<TemplateProps> = (args) => {
  const { data, labelPosition, fontWeight, labelColor, onClick } = args;

  const nodeWithLabelProps = {
    node: data,
    onClick: onClick,
    labelPosition: labelPosition,
    fontWeight: fontWeight,
    labelColor: labelColor,
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

// Basic node with a label
const myNode = {
  x: 100,
  y: 100,
  id: 'id',
  label: 'label',
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
  stroke: '#000',
  strokeWidth: 3,
};

export const FancyNodeWithLabel = Template.bind({});
FancyNodeWithLabel.args = {
  data: myFancyNode,
  labelPosition: 'right',
  labelColor: '#008822',
  fontWeight: 600,
};

export const ClickNodeOrLabel = Template.bind({});
ClickNodeOrLabel.args = {
  data: myNode,
  labelPosition: 'right',
  labelColor: '#008822',
  fontWeight: 600,
  onClick: () => {
    console.log('clicked!');
  },
};
