import { Story, Meta } from '@storybook/react/types-6-0';
import { HeaderProps } from '../components/headers/Header';

import Button, { ButtonProps } from '../components/buttons/Button';
import { DARK_ORANGE, LIGHT_GREEN } from '../constants/colors';

export default {
  title: 'Controls/Button',
  component: Button,
} as Meta;

const Template: Story<ButtonProps> = (args) => <Button {...args} />;
export const Default = Template.bind({});
Default.args = {
  text: 'Hello Developer',
};

export const Outlined = Template.bind({});
Outlined.args = {
  text: 'Outlined Button',
  type: 'outlined',
};

export const CustomColors: Story<Omit<ButtonProps, 'type'>> = (args) => (
  <div
    css={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      maxWidth: 200,
    }}
  >
    <Button {...args} styleOverrides={{ marginBottom: 10 }} />
    <Button {...args} type='outlined' />
  </div>
);
CustomColors.args = {
  text: 'Customized Colors',
  color: LIGHT_GREEN,
  onPressColor: DARK_ORANGE,
};
CustomColors.argTypes = {
  type: {
    control: {
      type: null,
    },
  },
};
