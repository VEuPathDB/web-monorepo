import { useState } from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';

import RadioButtonGroup, {
  RadioButtonGroupProps,
} from '../../components/widgets/RadioButtonGroup';

export default {
  title: 'Widgets/RadioButtonGroup',
  component: RadioButtonGroup,
} as Meta;

const Template: Story<RadioButtonGroupProps> = (args) => {
  const [selectedOption, setSelectedOption] = useState('Horizontal');

  return (
    <RadioButtonGroup
      {...args}
      onOptionSelected={setSelectedOption}
      selectedOption={selectedOption}
      containerStyles={{ ...args.containerStyles, margin: 25 }}
    />
  );
};

export const Basic = Template.bind({});
Basic.args = {
  options: ['Horizontal', 'Vertical'],
  label: 'Custom label',
  orientation: 'horizontal',
  labelPlacement: 'end',
  minWidth: 150,
  buttonColor: 'primary',
  margins: ['10em', '0', '0', '10em'],
  itemMarginRight: 50,
};

export const Renamed = Template.bind({});
Renamed.args = {
  ...Basic.args,
  optionLabels: ['Sideways', 'Upright'],
};
