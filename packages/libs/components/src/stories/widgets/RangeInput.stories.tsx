import React, { useState } from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';

import RangeInput, {
  RangeInputProps,
} from '../../components/widgets/RangeInput';

export default {
  title: 'Widgets/Range Input',
  component: RangeInput,
} as Meta;

const Template: Story<RangeInputProps> = (args) => {
  return (
    <RangeInput
      {...args}
      onRangeChange={(newRange) => {
        console.log(`new range = ${newRange.min} to ${newRange.max}`);
      }}
      containerStyles={{ ...args.containerStyles, margin: 25 }}
    />
  );
};

export const Basic = Template.bind({});
Basic.args = {
  defaultLower: 1,
  defaultUpper: 5,
};

export const Labelled = Template.bind({});
Labelled.args = {
  ...Basic.args,
  label: 'Labelled',
};

export const StartsEmpty = Template.bind({});
StartsEmpty.args = {
  label: 'Starts Empty',
};

export const Bounded = Template.bind({});
Bounded.args = {
  label: 'Bounded (0 to 10)',
  defaultLower: 1,
  defaultUpper: 9,
  minLower: 0,
  maxUpper: 10,
};

export const FullyLabelled = Template.bind({});
FullyLabelled.args = {
  label: 'Select a range between 0 and 10',
  minLower: 0,
  maxUpper: 10,
  lowerLabel: 'Lower bound',
  upperLabel: 'Upper bound',
};
