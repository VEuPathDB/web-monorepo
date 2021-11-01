import { css } from '@emotion/react';
import { Story, Meta } from '@storybook/react/types-6-0';

import TabbedDisplay, {
  TabbedDisplayProps,
} from '../../components/grids/TabbedDisplay';
import { DARK_GRAY } from '../../constants/colors';

import typography from '../../styleDefinitions/typography';

export default {
  title: 'Grids/TabbedDisplay',
  component: TabbedDisplay,
} as Meta;

const Template: Story<TabbedDisplayProps> = (args) => (
  <TabbedDisplay {...args} />
);

export const Basic = Template.bind({});
Basic.args = {
  tabs: [
    {
      displayName: 'Mike',
      content: (
        <div css={[typography.p]}>Some random content for the Mike tab.</div>
      ),
    },
    {
      displayName: 'Connor',
      content: (
        <div css={[typography.p]}>Some random content for the Connor tab.</div>
      ),
    },
  ],
};

export const CustomStyling: Story<TabbedDisplayProps> = (args) => (
  <TabbedDisplay {...args} />
);

CustomStyling.args = {
  styleOverrides: {
    active: css({
      borderBottomColor: 'red',
    }),
    hover: {
      color: DARK_GRAY,
      backgroundColor: 'transparent',
    },
  },
  tabs: [
    {
      displayName: 'Mike',
      content: (
        <div css={[typography.p]}>Some random content for the Mike tab.</div>
      ),
    },
    {
      displayName: 'Connor',
      content: (
        <div css={[typography.p]}>Some random content for the Connor tab.</div>
      ),
    },
  ],
};
