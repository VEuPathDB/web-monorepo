import React, { useState } from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';

import Switch, { SwitchProps } from '../../components/widgets/Switch';
import { LIGHT_RED } from '../../constants/colors';

export default {
  title: 'Widgets/Switch',
  component: Switch,
} as Meta;

const Template: Story<SwitchProps> = (args) => {
  const [value, setValue] = useState(args.state);

  return (
    <Switch
      {...args}
      state={value}
      onStateChange={(event) => {
        args.onStateChange(event);
        setValue(!value);
      }}
      containerStyles={{ ...args.containerStyles, margin: 25 }}
    />
  );
};

export const Basic = Template.bind({});
Basic.args = {
  state: false,
  onStateChange: (event) => console.log('Switch Toggled'),
};

export const Labelled = Template.bind({});
Labelled.args = {
  ...Basic.args,
  label: 'Labelled',
};

export const VerticalOrientation = Template.bind({});
VerticalOrientation.args = {
  ...Basic.args,
  label: 'Custom Color',
  color: LIGHT_RED,
};
