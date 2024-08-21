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

export const ControlledLinked: Story<DateRangeInputProps> = () => {
  const [range, setRange] = useState<DateRange>({
    min: '2001-01-01',
    max: '2001-01-31',
  });

  // there must be a cleverer way to do this
  // avoiding the cut and paste
  const handleChangeA = useCallback(
    (newRange: any) => {
      console.log(`A: new range = ${newRange.min} to ${newRange.max}`);
      setRange(newRange);
    },
    [setRange]
  );

  const handleChangeB = useCallback(
    (newRange: any) => {
      console.log(`B: new range = ${newRange.min} to ${newRange.max}`);
      setRange(newRange);
    },
    [setRange]
  );

  const SharedDateRangeInputArgs = {
    rangeBounds: { min: '2001-01-01', max: '2001-12-31' },
    range: range,
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
