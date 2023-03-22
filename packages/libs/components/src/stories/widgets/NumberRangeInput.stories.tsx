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

export const EmptyAtStart: Story<NumberRangeInputProps> = () => {
  const [range, setRange] = useState<NumberRange | undefined>();

  const handleChange = useCallback(
    (newRange) => {
      console.log(`new range = ${newRange?.min} to ${newRange?.max}`);
      setRange(newRange);
    },
    [setRange]
  );

  return (
    <NumberRangeInput label="A" onRangeChange={handleChange} range={range} />
  );
};

export const NoPartialRangesWithClear: Story<NumberRangeInputProps> = () => {
  const [range, setRange] = useState<NumberRange | undefined>();

  const handleChange = useCallback(
    (newRange) => {
      console.log(`new range = ${newRange?.min} to ${newRange?.max}`);
      setRange(newRange);
    },
    [setRange]
  );

  return (
    <NumberRangeInput
      label="Between 0 and 100"
      onRangeChange={handleChange}
      range={range}
      rangeBounds={{ min: 0, max: 100 }}
      allowPartialRange={false}
      showClearButton={true}
    />
  );
};

export const ControlledLinked: Story<NumberRangeInputProps> = () => {
  const [range, setRange] = useState<NumberRange>({ min: 1, max: 9 });

  // there must be a cleverer way to do this
  // avoiding the cut and paste
  const handleChangeA = useCallback(
    (newRange) => {
      console.log(`A: new range = ${newRange?.min} to ${newRange?.max}`);
      setRange(newRange);
    },
    [setRange]
  );

  const handleChangeB = useCallback(
    (newRange) => {
      console.log(`B: new range = ${newRange?.min} to ${newRange?.max}`);
      setRange(newRange);
    },
    [setRange]
  );

  const SharedNumberRangeInputArgs = {
    rangeBounds: { min: 0, max: 10 },
    range: range,
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
        label="B (with extra labels, required=true )"
        onRangeChange={handleChangeB}
        lowerLabel="minimum"
        upperLabel="maximum"
        required={true}
        {...SharedNumberRangeInputArgs}
      />
    </>
  );
};

export const CustomValidator: Story<NumberRangeInputProps> = () => {
  const [range, setRange] = useState<NumberRange | undefined>();

  const handleChange = useCallback(
    (newRange) => {
      console.log(`new range = ${newRange?.min} to ${newRange?.max}`);
      setRange(newRange);
    },
    [setRange]
  );
  const validate = useCallback(
    (range) => {
      console.log(`validating range ${range.min} to ${range.max}`);
      if (range && range.max != null && range.min != null) {
        if (range.max - range.min === 5) {
          return { validity: true, message: '' };
        } else {
          return { validity: false, message: 'range is not 5' };
        }
      } else {
        // return { validity: true, message: '' }; // like `required: false` (no warning for empty or partially entered range)
        return { validity: false, message: 'enter two numbers' }; // like `required: true` (warnings for the above)
      }
    },
    [range]
  );

  return (
    <NumberRangeInput
      label="Range must have width of 5"
      onRangeChange={handleChange}
      range={range}
      validator={validate}
      containerStyles={{ width: '400px' }}
    />
  );
};
