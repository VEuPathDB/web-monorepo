import React, { useState, useCallback } from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';

import {
  DateInput,
  DateInputProps,
} from '../../components/widgets/NumberAndDateInputs';

export default {
  title: 'Widgets/Date Input',
  component: DateInput,
} as Meta;

const ControlledTemplate: Story<DateInputProps> = (args) => {
  const [value, setValue] = useState<string>('2005-01-03');
  const onValueChange = useCallback(
    (newValue: any) => {
      console.log(`new value = ${newValue}`);
      setValue(newValue as string);
    },
    [setValue]
  );

  return (
    <DateInput
      {...args}
      value={value}
      onValueChange={onValueChange}
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
  minValue: '2000-01-01',
  maxValue: '2009-12-31',
};

export const ControlledLinkedPair: Story = () => {
  const [linkedValue, setLinkedValue] = useState<string>('2020-02-20');

  return (
    <>
      <DateInput
        value={linkedValue}
        label="A"
        onValueChange={(newValue) => {
          console.log(`A new value = ${newValue}`);
          setLinkedValue(newValue as string);
        }}
        containerStyles={{ margin: 25 }}
      />
      <DateInput
        value={linkedValue}
        label="B"
        onValueChange={(newValue) => {
          console.log(`B new value = ${newValue}`);
          setLinkedValue(newValue as string);
        }}
        containerStyles={{ margin: 25 }}
      />
    </>
  );
};

export const ControlledBounds: Story = () => {
  const [value, setValue] = useState<string>('2020-01-04');
  const [min, setMin] = useState<string>('2020-01-01');
  const [max, setMax] = useState<string>('2020-01-09');

  return (
    <>
      <DateInput
        value={value}
        label={`Value (${min} <= x <= ${max})`}
        minValue={min}
        maxValue={max}
        onValueChange={(newValue) => {
          console.log(`new value = ${newValue}`);
          // for some reason the `newValue != null` is needed because
          // the `useState<string>(0)` has an initial value provided
          if (newValue != null) setValue(newValue as string);
        }}
        containerStyles={{ margin: 25 }}
      />
      <DateInput
        value={min}
        maxValue={max}
        label="Min"
        onValueChange={(newValue) => {
          if (newValue != null) setMin(newValue as string);
        }}
        containerStyles={{ margin: 25 }}
      />
      <DateInput
        value={max}
        minValue={min}
        label="Max"
        onValueChange={(newValue) => {
          if (newValue != null) setMax(newValue as string);
        }}
        containerStyles={{ margin: 25 }}
      />
    </>
  );
};

export const CustomValidator = ControlledTemplate.bind({});
CustomValidator.args = {
  label: 'Weekdays only',
  validator: (newValue) => {
    // allow empty values in this case (emulates `required: false`)
    if (newValue == null) return { validity: true, message: '' };
    // uncomment to emulate `required: true` functionality
    // if (newValue == null) return { validity: false, message: 'please pick a day' };

    const date = new Date(newValue);
    if (date) {
      if (date.getDay() > 0 && date.getDay() < 6) {
        return { validity: true, message: '' };
      } else {
        return { validity: false, message: 'Please pick a weekday' };
      }
    } else {
      return { validity: false, message: 'badly formatted date' };
    }
  },
};
