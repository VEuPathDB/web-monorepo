import { Meta, Story } from '@storybook/react';
import {
  HorizontalDendrogram,
  HorizontalDendrogramProps,
} from '../../components/tidytree/HorizontalDendrogram';
import * as Mesa from '@veupathdb/coreui/lib/components/Mesa';

export default {
  title: 'TreeTable',
  component: HorizontalDendrogram, // TO DO: make TreeTable component!
  parameters: {},
  argTypes: {}, // couldn't get storybook-addon-deep-controls to work :(
} as Meta;

// the file is in the public/data directory
const sevenLeafTree =
  '(Bovine:0.69395,(Gibbon:0.36079,(Orang:0.33636,(Gorilla:0.17147,(Chimp:0.19268, Human:0.11927):0.08386):0.06124):0.15057):0.54939,Mouse:1.21460)';

const Template: Story<HorizontalDendrogramProps> = (args) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      <HorizontalDendrogram {...args} />
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

export const SevenRows = Template.bind({});
SevenRows.args = {
  data: sevenLeafTree,
  leafCount: 7,
  ...commonArgs,
};
