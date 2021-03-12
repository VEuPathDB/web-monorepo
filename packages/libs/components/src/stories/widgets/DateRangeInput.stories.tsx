import React, { useState, useCallback } from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';
import { DateRange } from '../../types/general';

import {
  DateRangeInput,
  DateRangeInputProps,
} from '../../components/widgets/NumberAndDateRangeInputs';

export default {
  title: 'Widgets/Date Range Input',
  component: DateRangeInput,
} as Meta;

const Template: Story<DateRangeInputProps> = (args) => {
  return (
    <DateRangeInput
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
  defaultRange: { min: new Date('2001-01-01'), max: new Date('2001-01-31') },
};

export const Labelled = Template.bind({});
Labelled.args = {
  ...Basic.args,
  label: 'Labelled',
};

export const Bounded = Template.bind({});
Bounded.args = {
  label: 'Bounded (2001-01-01 to 2001-12-31)',
  defaultRange: { min: new Date('2001-01-01'), max: new Date('2001-01-31') },
  rangeBounds: { min: new Date('2001-01-01'), max: new Date('2001-12-31') },
};

export const FullyLabelled = Template.bind({});
FullyLabelled.args = {
  label: 'Select a range between 2001-01-01 and 2001-12-31',
  defaultRange: { min: new Date('2001-01-01'), max: new Date('2001-01-31') },
  rangeBounds: { min: new Date('2001-01-01'), max: new Date('2001-12-31') },
  lowerLabel: 'Lower bound',
  upperLabel: 'Upper bound',
};

export const ControlledLinked: Story<DateRangeInputProps> = () => {
  const [range, setRange] = useState<DateRange>();

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

  const SharedDateRangeInputArgs = {
    defaultRange: { min: new Date('2001-01-01'), max: new Date('2001-01-31') },
    rangeBounds: { min: new Date('2001-01-01'), max: new Date('2001-12-31') },
    controlledRange: range,
    containerStyles: { margin: 25 },
  };

  return (
    <>
      <DateRangeInput
        label="A"
        onRangeChange={handleChangeA}
        {...SharedDateRangeInputArgs}
      />
      <DateRangeInput
        label="B"
        onRangeChange={handleChangeB}
        {...SharedDateRangeInputArgs}
      />
    </>
  );
};
