import { Meta, Story } from '@storybook/react';
import { TidyTree, TidyTreeProps } from '../../components/tidytree/TidyTree';
import { useQuery } from 'react-query';

export default {
  title: 'TidyTree',
  component: TidyTree,
  parameters: {},
  argTypes: {
    'options.layout': {
      control: { type: 'select' },
      options: ['horizontal', 'vertical', 'circular'],
    },
    'options.type': {
      control: { type: 'select' },
      options: ['tree', 'weighted', 'dendrogram'],
    },
    'options.mode': {
      control: { type: 'select' },
      options: ['square', 'smooth', 'straight'],
    },
    'options.equidistantLeaves': {
      control: 'boolean',
    },
    'options.ruler': {
      control: 'boolean',
    },
  },
} as Meta;

// the file is in the public/data directory
const newickURL = 'data/newick-example.json';

type NewickJSONType = {
  newick: string;
};

const Template: Story<TidyTreeProps> = (args) => {
  const newick = useQuery<string>({
    queryKey: [newickURL],
    queryFn: async () => {
      const response = await fetch(newickURL);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const json: NewickJSONType = await response.json();
      return json.newick;
    },
  });

  return <TidyTree {...args} data={newick.data} />;
};

export const Basic = Template.bind({});
Basic.args = {
  options: {},
};
