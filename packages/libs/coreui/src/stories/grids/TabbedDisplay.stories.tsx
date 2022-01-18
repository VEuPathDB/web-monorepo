import { Story, Meta } from '@storybook/react/types-6-0';

import TabbedDisplay, {
  TabbedDisplayProps,
} from '../../components/grids/TabbedDisplay';
import { H6 } from '../../components/headers';
import UIThemeProvider from '../../components/theming/UIThemeProvider';
import { green, purple } from '../../definitions/colors';

import typography from '../../styleDefinitions/typography';

export default {
  title: 'Grids/TabbedDisplay',
  component: TabbedDisplay,
} as Meta;

const tabs = [
  {
    displayName: 'View Study Details',
    content: (
      <div css={{ padding: 15 }}>
        <span css={[typography.p, { fontWeight: 'bold' }]}>
          Component Features
        </span>
        <ul css={[typography.p]}>
          <li>Theming Support</li>
          <li>Distinct Visual States for Selected/Unselected/Focus States</li>
          <li>Subtle animation effects to highlight state changes.</li>
          <li>Tab can be controlled programmatically. </li>
          <li>Support for both mouse/touch and keyboard based navigation.</li>
          <li>
            Proper accessibility attributes to aid assistive technologies.
          </li>
          <li>Can override many styling aspects for special cases.</li>
        </ul>
      </div>
    ),
    onSelect: () => console.log('View Study Details has been selected.'),
  },
  {
    displayName: 'Browse and Subset',
    content: (
      <div css={[typography.p, { padding: 15 }]}>
        Some random content for the Browse and Subset tab.
      </div>
    ),
  },
  {
    displayName: 'Visualize',
    content: (
      <div css={[typography.p, { padding: 15 }]}>
        Some random content for the Visualize tab.
      </div>
    ),
  },
  {
    displayName: 'Notes',
    content: (
      <div css={[typography.p, { padding: 15 }]}>
        Some random content for the Notes tab.
      </div>
    ),
  },
  {
    displayName: 'Downloads',
    content: (
      <div css={[typography.p, { padding: 15 }]}>
        Some random content for the Downloads tab.
      </div>
    ),
  },
];

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
  tabs,
} as TabbedDisplayProps;

export const ControlledTab = Template.bind({});
ControlledTab.args = {
  activeTab: 'Visualize',
  tabs: tabs,
} as TabbedDisplayProps;
