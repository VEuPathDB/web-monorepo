import React, { useState } from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';

import NumericInput, {
  NumericInputProps,
} from '../../components/widgets/NumericInput';

export default {
  title: 'Widgets/Numeric Input',
  component: NumericInput,
} as Meta;

const Template: Story<NumericInputProps> = (args) => {
  return (
    <NumericInput
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
  defaultValue: 42,
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
  defaultValue: 3,
  label: '0 <= x <= 5',
  minValue: 0,
  maxValue: 5,
};

const ControlledTemplate: Story<NumericInputProps> = (args) => {
  const [value, setValue] = useState<number>();
  return (
    <NumericInput
      {...args}
      controlledValue={value}
      onValueChange={(newValue) => {
        console.log(`new value = ${newValue}`);
        setValue(newValue);
      }}
      containerStyles={{ ...args.containerStyles, margin: 25 }}
    />
  );
};

export const Controlled = ControlledTemplate.bind({});
Controlled.args = {
  label: 'Controlled uninitialised',
};

export const ControlledInitialized = ControlledTemplate.bind({});
ControlledInitialized.args = {
  label: 'Controlled initialised',
  defaultValue: 5,
};

export const ControlledBounded = ControlledTemplate.bind({});
ControlledBounded.args = {
  label: 'Controlled (0 <= x <= 5)',
  minValue: 0,
  maxValue: 5,
};

export const ControlledLinkedPair: Story = () => {
  const [linkedValue, setLinkedValue] = useState<number>();

  return (
    <>
      <NumericInput
        controlledValue={linkedValue}
        label="A"
        onValueChange={(newValue) => {
          console.log(`A new value = ${newValue}`);
          setLinkedValue(newValue);
        }}
        containerStyles={{ margin: 25 }}
      />
      <NumericInput
        controlledValue={linkedValue}
        label="B"
        onValueChange={(newValue) => {
          console.log(`B new value = ${newValue}`);
          setLinkedValue(newValue);
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
      <NumericInput
        controlledValue={value}
        label={`Value (${min} <= x <= ${max})`}
        minValue={min}
        maxValue={max}
        onValueChange={(newValue) => {
          console.log(`new value = ${newValue}`);
          // for some reason the `newValue !== undefined` is needed because
          // the `useState<number>(0)` has an initial value provided
          if (newValue !== undefined) setValue(newValue);
        }}
        containerStyles={{ margin: 25 }}
      />
      <NumericInput
        controlledValue={min}
        maxValue={max}
        label="Min"
        onValueChange={(newValue) => {
          if (newValue !== undefined) setMin(newValue);
        }}
        containerStyles={{ margin: 25 }}
      />
      <NumericInput
        controlledValue={max}
        minValue={min}
        label="Max"
        onValueChange={(newValue) => {
          if (newValue !== undefined) setMax(newValue);
        }}
        containerStyles={{ margin: 25 }}
      />
    </>
  );
};
