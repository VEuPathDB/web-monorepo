import { Meta, Story } from '@storybook/react';
import { TidyTree, TidyTreeProps } from '../../components/tidytree/TidyTree';
import { useQuery } from 'react-query';

export default {
  title: 'TidyTree',
  component: TidyTree,
  parameters: {},
  argTypes: {}, // couldn't get storybook-addon-deep-controls to work :(
} as Meta;

// the file is in the public/data directory
const sevenLeafTree =
  '(Bovine:0.69395,(Gibbon:0.36079,(Orang:0.33636,(Gorilla:0.17147,(Chimp:0.19268, Human:0.11927):0.08386):0.06124):0.15057):0.54939,Mouse:1.21460)';

const threeLeafTree = '(dog:20, (elephant:30, horse:60):20):50';

type NewickJSONType = {
  newick: string;
};

// not used any more?
// url = data/newick-example.json
function getNewickJSON(url: string) {
  const newick = useQuery<string>({
    queryKey: [url],
    queryFn: async () => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const json: NewickJSONType = await response.json();
      return json.newick;
    },
  });
  return newick.data;
}

const Template: Story<TidyTreeProps> = (args) => {
  return <TidyTree {...args} />;
};

export const SevenLeaves = Template.bind({});
SevenLeaves.args = {
  data: sevenLeafTree,
  leafCount: 7,
  options: {
    margin: [0, 0, 0, 0],
  },
};

export const ThreeLeaves = Template.bind({});
ThreeLeaves.args = {
  data: threeLeafTree,
  leafCount: 3,
  options: {
    margin: [0, 0, 0, 0],
  },
};
