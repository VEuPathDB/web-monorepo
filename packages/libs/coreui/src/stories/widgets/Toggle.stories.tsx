import React from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';

import {
  default as Toggle,
  ToggleProps,
} from '../../components/widgets/Toggle';
import UIThemeProvider from '../../components/theming/UIThemeProvider';
import { green, magenta, orange, purple } from '../../definitions/colors';
import { useState } from 'react';

export default {
  title: 'Controls/Widgets/Toggle',
  component: Toggle,
} as Meta;

const Template: Story<ToggleProps> = (args) => {
  const [state, setState] = useState(args.value);

  return (
    <UIThemeProvider
      theme={{
        palette: {
          primary: { hue: orange, level: 600 },
          secondary: { hue: purple, level: 500 },
        },
      }}
    >
      <Toggle {...args} value={state} onChange={(state) => setState(state)} />
    </UIThemeProvider>
  );
};

export const Default = Template.bind({});
Default.args = {
  value: false,
} as ToggleProps;

export const LeftLabel = Template.bind({});
LeftLabel.args = {
  ...Default.args,
  label: 'Barbarian Hordes',
  labelPosition: 'left',
} as ToggleProps;

export const RightLabel = Template.bind({});
RightLabel.args = {
  ...Default.args,
  label: 'Zombie Hordes',
  labelPosition: 'right',
} as ToggleProps;

export const Small = Template.bind({});
Small.args = {
  ...Default.args,
  label: 'Barbarian Hordes',
  size: 'small',
} as ToggleProps;

export const Disabled = Template.bind({});
Disabled.args = {
  ...Default.args,
  label: 'Barbarian Hordes',
  disabled: true,
} as ToggleProps;

export const ThemeApplied = Template.bind({});
ThemeApplied.args = {
  ...Default.args,
  label: 'Barbarian Hordes',
  themeRole: 'primary',
} as ToggleProps;

export const StyleOverrides = Template.bind({});
StyleOverrides.args = {
  ...Default.args,
  label: 'Barbarian Hordes',
  styleOverrides: {
    default: {
      off: {
        backgroundColor: magenta[500],
        knobColor: 'white',
      },
      on: {
        backgroundColor: green[600],
        knobColor: 'white',
      },
    },
    hover: {
      off: {
        backgroundColor: magenta[600],
        knobColor: 'white',
      },
      on: {
        backgroundColor: green[700],
        knobColor: 'white',
      },
    },
  },
} as ToggleProps;
