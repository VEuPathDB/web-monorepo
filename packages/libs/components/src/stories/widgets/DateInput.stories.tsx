import React, { useState } from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';

import {
  DateInput,
  DateInputProps,
} from '../../components/widgets/NumberAndDateInputs';

export default {
  title: 'Widgets/Date Input',
  component: DateInput,
} as Meta;

const Template: Story<DateInputProps> = (args) => {
  return (
    <DateInput
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
  defaultValue: new Date('2021-12-21'),
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
  label: '2000-01-01 <= x <= 2009-12-31',
  minValue: new Date('2000-01-01'),
  maxValue: new Date('2009-12-31'),
};

export const BoundedInitialized = Template.bind({});
BoundedInitialized.args = {
  defaultValue: new Date('2005-01-01'),
  label: '2000-01-01 to 2009-12-31',
  minValue: new Date('2000-01-01'),
  maxValue: new Date('2009-12-31'),
};

const ControlledTemplate: Story<DateInputProps> = (args) => {
  const [value, setValue] = useState<Date>(new Date('2005-01-01'));
  return (
    <DateInput
      {...args}
      controlledValue={value}
      onValueChange={(newValue) => {
        console.log(`new value = ${newValue}`);
        setValue(newValue as Date);
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
  label: 'Controlled (2000-01-01 to 2009-12-31)',
  minValue: new Date('2000-01-01'),
  maxValue: new Date('2009-12-31'),
};

export const ControlledLinkedPair: Story = () => {
  const [linkedValue, setLinkedValue] = useState<Date>(new Date('2020-02-20'));

  return (
    <>
      <DateInput
        controlledValue={linkedValue}
        label="A"
        onValueChange={(newValue) => {
          console.log(`A new value = ${newValue}`);
          setLinkedValue(newValue as Date);
        }}
        containerStyles={{ margin: 25 }}
      />
      <DateInput
        controlledValue={linkedValue}
        label="B"
        onValueChange={(newValue) => {
          console.log(`B new value = ${newValue}`);
          setLinkedValue(newValue as Date);
        }}
        containerStyles={{ margin: 25 }}
      />
    </>
  );
};

export const ControlledBounds: Story = () => {
  const [value, setValue] = useState<Date>(new Date('2020-01-04'));
  const [min, setMin] = useState<Date>(new Date('2020-01-01'));
  const [max, setMax] = useState<Date>(new Date('2020-01-09'));

  return (
    <>
      <DateInput
        controlledValue={value}
        label={`Value (${min} <= x <= ${max})`}
        minValue={min}
        maxValue={max}
        onValueChange={(newValue) => {
          console.log(`new value = ${newValue}`);
          // for some reason the `newValue !== undefined` is needed because
          // the `useState<Date>(0)` has an initial value provided
          if (newValue !== undefined) setValue(newValue as Date);
        }}
        containerStyles={{ margin: 25 }}
      />
      <DateInput
        controlledValue={min}
        maxValue={max}
        label="Min"
        onValueChange={(newValue) => {
          if (newValue !== undefined) setMin(newValue as Date);
        }}
        containerStyles={{ margin: 25 }}
      />
      <DateInput
        controlledValue={max}
        minValue={min}
        label="Max"
        onValueChange={(newValue) => {
          if (newValue !== undefined) setMax(newValue as Date);
        }}
        containerStyles={{ margin: 25 }}
      />
    </>
  );
};
