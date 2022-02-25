import { Story, Meta } from '@storybook/react/types-6-0';

import {
  OutlinedSwitch,
  SwitchVariantProps,
} from '../../../components/widgets/switch';
import UIThemeProvider from '../../../components/theming/UIThemeProvider';
import {
  mutedGreen,
  mutedMagenta,
  orange,
  purple,
} from '../../../definitions/colors';
import { useState } from 'react';

export default {
  title: 'Controls/Widgets/Switch/OutlinedSwitch',
  component: OutlinedSwitch,
} as Meta;

const Template: Story<SwitchVariantProps<boolean>> = (args) => {
  const [selectedOption, setSelectedOption] = useState(args.selectedOption);

  return (
    <UIThemeProvider
      theme={{
        palette: {
          primary: { hue: orange, level: 600 },
          secondary: { hue: purple, level: 500 },
        },
      }}
    >
      <OutlinedSwitch
        {...args}
        selectedOption={selectedOption}
        onOptionChange={(selection) => setSelectedOption(selection)}
      />
    </UIThemeProvider>
  );
};

export const Default = Template.bind({});
Default.args = {
  options: [true, false],
  selectedOption: true,
  disabled: false,
} as SwitchVariantProps<boolean>;

export const LeftLabel = Template.bind({});
LeftLabel.args = {
  ...Default.args,
  labels: {
    left: 'Barbarian Hordes',
  },
} as SwitchVariantProps<boolean>;

export const RightLabel = Template.bind({});
RightLabel.args = {
  ...Default.args,
  labels: {
    right: 'Zombie Hordes',
  },
} as SwitchVariantProps<boolean>;

export const BothLabels = Template.bind({});
BothLabels.args = {
  ...Default.args,
  labels: {
    left: 'Barbarian Hordes',
    right: 'Zombie Hordes',
  },
} as SwitchVariantProps<boolean>;

export const Disabled = Template.bind({});
Disabled.args = {
  ...Default.args,
  labels: {
    left: 'Barbarian Hordes',
    right: 'Zombie Hordes',
  },
  disabled: true,
} as SwitchVariantProps<boolean>;

export const ThemeApplied = Template.bind({});
ThemeApplied.args = {
  ...Default.args,
  labels: {
    left: 'Barbarian Hordes',
    right: 'Zombie Hordes',
  },
  themeRole: 'primary',
} as SwitchVariantProps<boolean>;

export const StyleOverrides = Template.bind({});
StyleOverrides.args = {
  ...Default.args,
  labels: {
    left: 'Barbarian Hordes',
    right: 'Zombie Hordes',
  },
  styleOverrides: {
    default: [
      {
        backgroundColor: undefined,
        borderColor: mutedMagenta[500],
        knobColor: mutedMagenta[500],
      },
      {
        backgroundColor: undefined,
        knobColor: mutedGreen[500],
        borderColor: mutedGreen[500],
      },
    ],
    hover: [
      {
        backgroundColor: undefined,
        knobColor: mutedMagenta[600],
        borderColor: mutedMagenta[600],
      },
      {
        backgroundColor: undefined,
        knobColor: mutedGreen[600],
        borderColor: mutedGreen[600],
      },
    ],
  },
} as SwitchVariantProps<boolean>;
