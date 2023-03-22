import { Story, Meta } from '@storybook/react/types-6-0';

import Checkbox, { CheckboxProps } from '../../components/widgets/Checkbox';
import UIThemeProvider from '../../components/theming/UIThemeProvider';
import { green, purple, teal } from '../../definitions/colors';
import { useEffect, useState } from 'react';

export default {
  title: 'Controls/Widgets/Checkbox',
  component: Checkbox,
} as Meta;

const Template: Story<CheckboxProps> = (args) => {
  const [selected, setSelected] = useState(args.selected);

  useEffect(() => {
    setSelected(args.selected);
  }, [args.selected]);

  return (
    <UIThemeProvider
      theme={{
        palette: {
          primary: { hue: teal, level: 600 },
          secondary: { hue: purple, level: 500 },
        },
      }}
    >
      <Checkbox
        {...args}
        selected={selected}
        onToggle={() => setSelected(!selected)}
      />
    </UIThemeProvider>
  );
};

export const Default = Template.bind({});
Default.args = {
  selected: false,
  onToggle: () => console.log('Clicked'),
  themeRole: undefined,
} as CheckboxProps;

export const UseTheme = Template.bind({});
UseTheme.args = {
  ...Default.args,
  themeRole: 'primary',
} as CheckboxProps;

export const CustomSize = Template.bind({});
CustomSize.args = {
  ...Default.args,
  themeRole: 'primary',
  styleOverrides: { size: 48 },
} as CheckboxProps;
