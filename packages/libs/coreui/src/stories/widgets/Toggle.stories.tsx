import React from "react";
import { Story, Meta } from "@storybook/react/types-6-0";

import { Toggle, SwitchVariantProps } from "../../components/widgets/switch";
import UIThemeProvider from "../../components/theming/UIThemeProvider";
import { green, magenta, orange, purple } from "../../definitions/colors";
import { useState } from "react";

export default {
  title: "Controls/Widgets/Switch/FilledSwitch",
  component: Toggle,
} as Meta;

const Template: Story<SwitchVariantProps> = (args) => {
  const [state, setState] = useState(args.state);

  return (
    <UIThemeProvider
      theme={{
        palette: {
          primary: { hue: orange, level: 600 },
          secondary: { hue: purple, level: 500 },
        },
      }}
    >
      <Toggle
        {...args}
        state={state}
        onToggle={(state) => setState(state)}
      />
    </UIThemeProvider>
  );
};

export const Default = Template.bind({});
Default.args = {
  state: true,
} as SwitchVariantProps;

export const LeftLabel = Template.bind({});
LeftLabel.args = {
  ...Default.args,
  label: "Barbarian Hordes",
  labelPosition: 'left',
} as SwitchVariantProps;

export const RightLabel = Template.bind({});
RightLabel.args = {
  ...Default.args,
  label: "Zombie Hordes",
  labelPosition: 'right',
} as SwitchVariantProps;

export const Small = Template.bind({});
Small.args = {
  ...Default.args,
  labels: "Barbarian Hordes",
  size: 'small',
} as SwitchVariantProps;

export const Disabled = Template.bind({});
Disabled.args = {
  ...Default.args,
  labels: "Barbarian Hordes",
  disabled: true,
} as SwitchVariantProps;

export const ThemeApplied = Template.bind({});
ThemeApplied.args = {
  ...Default.args,
  labels: "Barbarian Hordes",
  themeRole: "primary",
} as SwitchVariantProps;

export const StyleOverrides = Template.bind({});
StyleOverrides.args = {
  ...Default.args,
  labels: "Barbarian Hordes",
  styleOverrides: {
    default: [
      {
        backgroundColor: magenta[500],
        knobColor: "white",
      },
      {
        backgroundColor: green[600],
        knobColor: "white",
      },
    ],
    hover: [
      {
        backgroundColor: magenta[600],
        knobColor: "white",
      },
      {
        backgroundColor: green[700],
        knobColor: "white",
      },
    ],
  },
} as SwitchVariantProps;
