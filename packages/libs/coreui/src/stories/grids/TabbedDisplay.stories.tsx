import { css } from '@emotion/react';
import { Story, Meta } from '@storybook/react/types-6-0';

import TabbedDisplay, {
  TabbedDisplayProps,
} from '../../components/grids/TabbedDisplay';
import UIThemeProvider from '../../components/theming/UIThemeProvider';
import { green, purple } from '../../definitions/colors';

import typography from '../../styleDefinitions/typography';

export default {
  title: 'Grids/TabbedDisplay',
  component: TabbedDisplay,
} as Meta;

const Template: Story<TabbedDisplayProps> = (args) => (
  <UIThemeProvider
    theme={{
      palette: {
        primary: { hue: green, level: 600 },
        secondary: { hue: purple, level: 500 },
      },
    }}
  >
    <TabbedDisplay {...args} />
  </UIThemeProvider>
);

export const Basic = Template.bind({});
Basic.args = {
  tabs: [
    {
      displayName: 'Mike',
      content: (
        <div css={[typography.p, { padding: 15 }]}>
          Some random content for the Mike tab.
        </div>
      ),
      onSelect: () => console.log('Mike has been selected.'),
    },
    {
      displayName: 'Connor',
      content: (
        <div css={[typography.p, { padding: 15 }]}>
          Some random content for the Connor tab.
        </div>
      ),
    },
  ],
} as TabbedDisplayProps;

export const ControlledTab = Template.bind({});
ControlledTab.args = {
  activeTab: 'Mike',
  tabs: [
    {
      displayName: 'Mike',
      content: (
        <div css={[typography.p, { padding: 15 }]}>
          Some random content for the Mike tab.
        </div>
      ),
      onSelect: () => console.log('Mike has been selected.'),
    },
    {
      displayName: 'Connor',
      content: (
        <div css={[typography.p, { padding: 15 }]}>
          Some random content for the Connor tab.
        </div>
      ),
    },
  ],
} as TabbedDisplayProps;
