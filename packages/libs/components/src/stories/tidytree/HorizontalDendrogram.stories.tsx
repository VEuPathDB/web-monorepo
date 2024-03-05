import { Meta, Story } from '@storybook/react';
import {
  HorizontalDendrogram,
  HorizontalDendrogramProps,
} from '../../components/tidytree/HorizontalDendrogram';
import { useQuery } from 'react-query';
import React, { useState } from 'react';
import { CheckboxList } from '../../../../coreui/lib';

export default {
  title: 'HorizontalDendrogram',
  component: HorizontalDendrogram,
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

// not needed any more?
// maybe we'll use it for larger example trees like
// this --> url = data/newick-example.json
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

const Template: Story<HorizontalDendrogramProps> = (args) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      <HorizontalDendrogram {...args} />
      <Stripes
        count={args.leafCount}
        stripeHeight={args.rowHeight}
        width={400}
      />
    </div>
  );
};

const commonArgs: Partial<HorizontalDendrogramProps> = {
  width: 400,
  rowHeight: 50,
  options: {
    margin: [0, 10, 0, 10],
  },
};

export const SevenLeaves = Template.bind({});
SevenLeaves.args = {
  data: sevenLeafTree,
  leafCount: 7,
  ...commonArgs,
};

export const ThreeLeaves = Template.bind({});
ThreeLeaves.args = {
  data: threeLeafTree,
  leafCount: 3,
  ...commonArgs,
};

interface HighlightedHorizontalDendrogramProps
  extends HorizontalDendrogramProps {
  allNodeIds: string[];
}

const Highlighting: Story<HighlightedHorizontalDendrogramProps> = (args) => {
  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);

  return (
    <>
      <div
        style={{
          width: '800px',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
        }}
      >
        <HorizontalDendrogram {...args} highlightedNodeIds={highlightedNodes} />
        <CheckboxList
          items={args.allNodeIds.map((id) => ({ display: id, value: id }))}
          value={highlightedNodes}
          onChange={setHighlightedNodes}
        />
      </div>
    </>
  );
};

export const HighlightedSeven = Highlighting.bind({});
HighlightedSeven.args = {
  data: sevenLeafTree,
  leafCount: 7,
  allNodeIds: [
    'Bovine',
    'Gibbon',
    'Orang',
    'Gorilla',
    'Chimp',
    'Human',
    'Mouse',
  ],
  ...commonArgs,
};

/**
 * Some stripy divs to simulate a table with fixed row height
 */
interface StripesProps {
  count: number; // The number of stripes to display
  width: number; // width of stripes in px
  stripeHeight: number; // height in px of each stripe
}

interface StripeProps {
  height: number;
  isDark: boolean;
}

const Stripe: React.FC<StripeProps> = ({ isDark, height }) => {
  const style = {
    height: height + 'px',
    width: '100%',
    backgroundColor: isDark ? '#707070' : '#A8A8A8', // dark grey : light grey
  };

  return <div style={style} />;
};

const Stripes: React.FC<StripesProps> = ({ count, stripeHeight, width }) => {
  const style = {
    height: '50px',
    width: width + 'px',
  };
  return (
    <div style={style}>
      {Array.from({ length: count }, (_, index) => (
        <Stripe key={index} height={stripeHeight} isDark={index % 2 === 0} />
      ))}
    </div>
  );
};
