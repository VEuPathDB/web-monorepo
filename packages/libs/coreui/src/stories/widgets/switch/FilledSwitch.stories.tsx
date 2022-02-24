import { Story, Meta } from '@storybook/react/types-6-0';

import {
  FilledSwitch,
  SwitchVariantProps,
} from '../../../components/widgets/switch';
import UIThemeProvider from '../../../components/theming/UIThemeProvider';
import {
  blue,
  green,
  magenta,
  mutedGreen,
  mutedMagenta,
  orange,
  purple,
  teal,
} from '../../../definitions/colors';
import { useState } from 'react';

export default {
  title: 'Controls/Widgets/Switch/FilledSwitch',
  component: FilledSwitch,
} as Meta;

const Template: Story<SwitchVariantProps> = (args) => {
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
      <FilledSwitch
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
} as SwitchVariantProps;

export const LeftLabel = Template.bind({});
LeftLabel.args = {
  ...Default.args,
  labels: {
    left: 'Barbarian Hordes',
  },
} as SwitchVariantProps;

export const RightLabel = Template.bind({});
RightLabel.args = {
  ...Default.args,
  labels: {
    right: 'Zombie Hordes',
  },
} as SwitchVariantProps;

export const BothLabels = Template.bind({});
BothLabels.args = {
  ...Default.args,
  labels: {
    left: 'Barbarian Hordes',
    right: 'Zombie Hordes',
  },
} as SwitchVariantProps;

export const ThemeApplied = Template.bind({});
ThemeApplied.args = {
  ...Default.args,
  labels: {
    left: 'Barbarian Hordes',
    right: 'Zombie Hordes',
  },
  themeRole: 'primary',
} as SwitchVariantProps;

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
        backgroundColor: magenta[500],
        knobColor: magenta[100],
      },
      {
        backgroundColor: green[600],
        knobColor: green[100],
      },
    ],
    hover: [
      {
        backgroundColor: magenta[600],
        knobColor: magenta[100],
      },
      {
        backgroundColor: green[700],
        knobColor: green[100],
      },
    ],
  },
} as SwitchVariantProps;
