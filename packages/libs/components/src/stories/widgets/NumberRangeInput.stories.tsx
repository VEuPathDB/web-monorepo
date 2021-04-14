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

export const ControlledLinked: Story<NumberRangeInputProps> = () => {
  const [range, setRange] = useState<NumberRange>({ min: 1, max: 9 });

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
        label="B"
        onRangeChange={handleChangeB}
        {...SharedNumberRangeInputArgs}
      />
    </>
  );
};
