import { Meta, Story } from '@storybook/react';
import { TidyTree } from '../../components/tidytree/TidyTree';
import { useQuery } from 'react-query';

export default {
  title: 'TidyTree',
  component: TidyTree,
  parameters: {},
} as Meta;

// the file is in the public/data directory
const newickURL = 'data/newick-example.json';

type NewickJSONType = {
  newick: string;
};

export const Basic = () => {
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

  return newick.data ? <TidyTree data={newick.data} /> : null;
};
