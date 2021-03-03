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
        console.log(`set new value = ${newValue}`);
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

export const ExternallyControlled: Story = () => {
  const [linkedValue, setLinkedValue] = useState<number | undefined>();

  return (
    <>
      <NumericInput
        label="Master (unbounded)"
        onValueChange={(newValue) => {
          console.log(`master set new value = ${newValue}`);
          setLinkedValue(newValue);
        }}
      />
      <NumericInput
        slaveValue={linkedValue}
        label="Slave (0 <= x <= 5)"
        minValue={0}
        maxValue={5}
        onValueChange={(newValue) => {
          console.log(`slave set new value = ${newValue}`);
        }}
      />
    </>
  );
};
