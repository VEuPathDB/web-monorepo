import { Story, Meta } from '@storybook/react/types-6-0';

import {
  FloatingSwitch,
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
  title: 'Controls/Widgets/Switch/FloatingSwitch',
  component: FloatingSwitch,
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
      <FloatingSwitch
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
        backgroundColor: mutedMagenta[200],
        knobColor: mutedMagenta[500],
      },
      {
        backgroundColor: mutedGreen[200],
        knobColor: mutedGreen[500],
      },
    ],
    hover: [
      {
        backgroundColor: mutedMagenta[300],
        knobColor: mutedMagenta[100],
      },
      {
        backgroundColor: mutedGreen[300],
        knobColor: mutedGreen[100],
      },
    ],
  },
} as SwitchVariantProps<boolean>;
