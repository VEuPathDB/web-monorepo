import React, { useState } from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';

import {
  NumberInput,
  NumberInputProps,
} from '../../components/widgets/NumberAndDateInputs';

export default {
  title: 'Widgets/Number Input',
  component: NumberInput,
} as Meta;

const Template: Story<NumberInputProps> = (args) => {
  return (
    <NumberInput
      {...args}
      onValueChange={(newValue) => {
        console.log(`new value = ${newValue}`);
      }}
      containerStyles={{ ...args.containerStyles, margin: 25 }}
    />
  );
};

export const Basic = Template.bind({});
Basic.args = {
  value: 42,
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

export const NotSoWide = Template.bind({});
NotSoWide.args = {
  label: 'Not so wide',
  containerStyles: {
    width: 100,
  },
};

export const Bounded = Template.bind({});
Bounded.args = {
  label: '0 <= x <= 5',
  minValue: 0,
  maxValue: 5,
};

export const BoundedInitialized = Template.bind({});
BoundedInitialized.args = {
  value: 3,
  label: '0 <= x <= 5',
  minValue: 0,
  maxValue: 5,
};

const ControlledTemplate: Story<NumberInputProps> = (args) => {
  const [value, setValue] = useState<number>(0);
  return (
    <NumberInput
      {...args}
      value={value}
      onValueChange={(newValue) => {
        console.log(`new value = ${newValue}`);
        setValue(newValue as number);
      }}
      containerStyles={{ ...args.containerStyles, margin: 25 }}
    />
  );
};

export const Controlled = ControlledTemplate.bind({});
Controlled.args = {
  label: 'Controlled',
};

export const ControlledBounded = ControlledTemplate.bind({});
ControlledBounded.args = {
  label: 'Controlled (0 <= x <= 5)',
  minValue: 0,
  maxValue: 5,
};

export const ControlledLinkedPair: Story = () => {
  const [linkedValue, setLinkedValue] = useState<number>(0);

  return (
    <>
      <NumberInput
        value={linkedValue}
        label="A"
        onValueChange={(newValue) => {
          console.log(`A new value = ${newValue}`);
          setLinkedValue(newValue as number);
        }}
        containerStyles={{ margin: 25 }}
      />
      <NumberInput
        value={linkedValue}
        label="B"
        onValueChange={(newValue) => {
          console.log(`B new value = ${newValue}`);
          setLinkedValue(newValue as number);
        }}
        containerStyles={{ margin: 25 }}
      />
    </>
  );
};

export const ControlledBounds: Story = () => {
  const [value, setValue] = useState<number>(0);
  const [min, setMin] = useState<number>(-5);
  const [max, setMax] = useState<number>(5);

  return (
    <>
      <NumberInput
        value={value}
        label={`Value (${min} <= x <= ${max})`}
        minValue={min}
        maxValue={max}
        onValueChange={(newValue) => {
          console.log(`new value = ${newValue}`);
          // for some reason the `newValue !== undefined` is needed because
          // the `useState<number>(0)` has an initial value provided
          if (newValue !== undefined) setValue(newValue as number);
        }}
        containerStyles={{ margin: 25 }}
      />
      <NumberInput
        value={min}
        maxValue={max}
        label="Min"
        onValueChange={(newValue) => {
          if (newValue !== undefined) setMin(newValue as number);
        }}
        containerStyles={{ margin: 25 }}
      />
      <NumberInput
        value={max}
        minValue={min}
        label="Max"
        onValueChange={(newValue) => {
          if (newValue !== undefined) setMax(newValue as number);
        }}
        containerStyles={{ margin: 25 }}
      />
    </>
  );
};
