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
  const [value, setValue] = useState<number | undefined>(args.value);

  return (
    <NumericInput
      {...args}
      value={value}
      onValueChange={(newValue) => {
        setValue(newValue);
        console.log(`set new value = ${newValue}`);
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
