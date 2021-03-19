import React, { useState, useCallback } from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';
import { NumberRange } from '../../types/general';

import {
  NumberRangeInput,
  NumberRangeInputProps,
} from '../../components/widgets/NumberAndDateRangeInputs';

export default {
  title: 'Widgets/Number Range Input',
  component: NumberRangeInput,
} as Meta;

const Template: Story<NumberRangeInputProps> = (args) => {
  return (
    <NumberRangeInput
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
  range: { min: 1, max: 5 },
};

export const Labelled = Template.bind({});
Labelled.args = {
  ...Basic.args,
  label: 'Labelled',
};

export const Bounded = Template.bind({});
Bounded.args = {
  label: 'Bounded (0 to 10)',
  range: { min: 1, max: 9 },
  rangeBounds: { min: 0, max: 10 },
};

export const FullyLabelled = Template.bind({});
FullyLabelled.args = {
  label: 'Select a range between 0 and 10',
  range: { min: 1, max: 9 },
  rangeBounds: { min: 0, max: 10 },
  lowerLabel: 'Lower bound',
  upperLabel: 'Upper bound',
};

export const ControlledLinked: Story<NumberRangeInputProps> = () => {
  const [range, setRange] = useState<NumberRange>();

  // there must be a cleverer way to do this
  // avoiding the cut and paste
  const handleChangeA = useCallback(
    (newRange) => {
      console.log(`A: new range = ${newRange.min} to ${newRange.max}`);
      setRange(newRange);
    },
    [setRange]
  );

  const handleChangeB = useCallback(
    (newRange) => {
      console.log(`B: new range = ${newRange.min} to ${newRange.max}`);
      setRange(newRange);
    },
    [setRange]
  );

  const SharedNumberRangeInputArgs = {
    defaultRange: { min: 1, max: 9 },
    rangeBounds: { min: 0, max: 10 },
    controlledRange: range,
    containerStyles: { margin: 25 },
  };

  return (
    <>
      <NumberRangeInput
        label="A"
        onRangeChange={handleChangeA}
        {...SharedNumberRangeInputArgs}
      />
      <NumberRangeInput
        label="B"
        onRangeChange={handleChangeB}
        {...SharedNumberRangeInputArgs}
      />
    </>
  );
};
