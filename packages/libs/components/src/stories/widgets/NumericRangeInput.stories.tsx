import React, { useState, useCallback } from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';
import { NumericRange } from '../../types/general';

import NumericRangeInput, {
  NumericRangeInputProps,
} from '../../components/widgets/NumericRangeInput';

export default {
  title: 'Widgets/Numeric Range Input',
  component: NumericRangeInput,
} as Meta;

const Template: Story<NumericRangeInputProps> = (args) => {
  return (
    <NumericRangeInput
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
  defaultLower: 1,
  defaultUpper: 9,
  minLower: 0,
  maxUpper: 10,
  lowerLabel: 'Lower bound',
  upperLabel: 'Upper bound',
};

export const ControlledLinked: Story<NumericRangeInputProps> = () => {
  const [range, setRange] = useState<NumericRange>();

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

  const SharedNumericRangeInputArgs = {
    defaultLower: 1,
    defaultUpper: 9,
    minLower: 0,
    maxUpper: 10,
    controlledRange: range,
    containerStyles: { margin: 25 },
  };

  return (
    <>
      <NumericRangeInput
        label="A"
        onRangeChange={handleChangeA}
        {...SharedNumericRangeInputArgs}
      />
      <NumericRangeInput
        label="B"
        onRangeChange={handleChangeB}
        {...SharedNumericRangeInputArgs}
      />
    </>
  );
};
