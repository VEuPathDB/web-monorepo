import React, { useState } from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';

import ButtonGroup, {
  ButtonGroupProps,
} from '../../components/widgets/ButtonGroup';

export default {
  title: 'Widgets/ButtonGroup',
  component: ButtonGroup,
} as Meta;

const Template: Story<ButtonGroupProps> = (args) => {
  const [selectedOption, setSelectedOption] = useState('Vertical');

  return (
    <ButtonGroup
      {...args}
      onOptionSelected={setSelectedOption}
      selectedOption={selectedOption}
      containerStyles={{ ...args.containerStyles, margin: 25 }}
    />
  );
};

export const Basic = Template.bind({});
Basic.args = {
  options: ['Vertical', 'Horizontal'],
};

export const WithLabel = Template.bind({});
WithLabel.args = {
  ...Basic.args,
  label: 'Custom Label',
};

export const VerticalOrientation = Template.bind({});
VerticalOrientation.args = {
  ...Basic.args,
  orientation: 'vertical',
};

export const CustomStyling = Template.bind({});
CustomStyling.args = {
  ...Basic.args,
  label: 'Custom Container Styling',
  containerStyles: {
    padding: 10,
    borderRadius: 5,
    background:
      'linear-gradient(#ffffff, #ffffff), linear-gradient(to right, red, purple)',
    backgroundOrigin: 'padding-box, border-box',
    backgroundRepeat: 'no-repeat' /* this is important */,
    border: '2px solid transparent',
    maxWidth: 200,
  },
};
