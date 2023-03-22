import React, { useCallback, useState } from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';

import {
  NumberInput,
  NumberInputProps,
} from '../../components/widgets/NumberAndDateInputs';

export default {
  title: 'Widgets/Number Input',
  component: NumberInput,
} as Meta;

const ControlledTemplate: Story<NumberInputProps> = (args) => {
  const [value, setValue] = useState<number | undefined>(args.value ?? 1);
  const onValueChange = useCallback(
    (newValue) => {
      console.log(`new value = ${newValue}`);
      setValue(newValue as number);
    },
    [setValue]
  );

  return (
    <NumberInput
      {...args}
      value={value}
      onValueChange={onValueChange}
      containerStyles={{ ...args.containerStyles, margin: 25 }}
    />
  );
};

export const NoBounds = ControlledTemplate.bind({});
NoBounds.args = {
  label: 'Controlled',
};

export const NoLabel = ControlledTemplate.bind({});
NoLabel.args = {};

export const Bounded = ControlledTemplate.bind({});
Bounded.args = {
  label: 'Controlled (0 <= x <= 5)',
  minValue: 0,
  maxValue: 5,
};

export const RequiredBounded = ControlledTemplate.bind({});
RequiredBounded.args = {
  label: 'Controlled (0 <= x <= 5)',
  minValue: 0,
  maxValue: 5,
  required: true,
};

export const ExternallyOutOfBounds = ControlledTemplate.bind({});
ExternallyOutOfBounds.args = {
  label: 'Controlled (0 <= x <= 5)',
  minValue: 0,
  maxValue: 5,
  value: 10,
};

export const BoundedNonZero = ControlledTemplate.bind({});
BoundedNonZero.args = {
  label: 'Controlled (3 <= x <= 9)',
  value: 6,
  minValue: 3,
  maxValue: 9,
};

export const SilentBoundsCheck = ControlledTemplate.bind({});
SilentBoundsCheck.args = {
  label: 'Controlled (10 <= x <= 12)',
  value: 11,
  minValue: 10,
  maxValue: 12,
  displayRangeViolationWarnings: false,
};

export const LinkedPair: Story = () => {
  const [linkedValue, setLinkedValue] = useState<number>(0);

  return (
    <>
      <NumberInput
        value={linkedValue}
        label="A"
        onValueChange={(newValue) => {
          console.log(`A new value = ${newValue}`);
          setLinkedValue(newValue as number);
        }}
        containerStyles={{ margin: 25 }}
      />
      <NumberInput
        value={linkedValue}
        label="B"
        onValueChange={(newValue) => {
          console.log(`B new value = ${newValue}`);
          setLinkedValue(newValue as number);
        }}
        containerStyles={{ margin: 25 }}
      />
    </>
  );
};

export const LinkedRequiredPair: Story = () => {
  const [linkedValue, setLinkedValue] = useState<number>(0);

  return (
    <>
      <NumberInput
        value={linkedValue}
        label="A"
        onValueChange={(newValue) => {
          console.log(`A new value = ${newValue}`);
          setLinkedValue(newValue as number);
        }}
        required={true}
        containerStyles={{ margin: 25 }}
      />
      <NumberInput
        value={linkedValue}
        label="B"
        onValueChange={(newValue) => {
          console.log(`B new value = ${newValue}`);
          setLinkedValue(newValue as number);
        }}
        required={true}
        containerStyles={{ margin: 25 }}
      />
    </>
  );
};

export const ControlledBounds: Story = () => {
  const [value, setValue] = useState<number>(0);
  const [min, setMin] = useState<number>(-5);
  const [max, setMax] = useState<number>(5);

  return (
    <>
      <NumberInput
        value={value}
        label={`Value (${min} <= x <= ${max})`}
        minValue={min}
        maxValue={max}
        onValueChange={(newValue) => {
          console.log(`new value = ${newValue}`);
          // for some reason the `newValue != null` is needed because
          // the `useState<number>(0)` has an initial value provided
          if (newValue != null) setValue(newValue as number);
        }}
        containerStyles={{ margin: 25 }}
      />
      <NumberInput
        value={min}
        maxValue={max}
        label="Min"
        onValueChange={(newValue) => {
          if (newValue != null) setMin(newValue as number);
        }}
        containerStyles={{ margin: 25 }}
      />
      <NumberInput
        value={max}
        minValue={min}
        label="Max"
        onValueChange={(newValue) => {
          if (newValue != null) setMax(newValue as number);
        }}
        containerStyles={{ margin: 25 }}
      />
    </>
  );
};

export const CustomValidator = ControlledTemplate.bind({});
CustomValidator.args = {
  label: 'Even numbers 0 <= x <= 10',
  validator: (newValue) => {
    const validity =
      newValue != null &&
      typeof newValue === 'number' &&
      newValue >= 0 &&
      newValue <= 10 &&
      newValue % 2 == 0;
    return { validity, message: validity ? '' : 'Not an even number 0 to 10' };
  },
  containerStyles: { width: '40ch' },
};
