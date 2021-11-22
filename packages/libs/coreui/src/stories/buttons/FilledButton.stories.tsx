import { Story, Meta } from '@storybook/react/types-6-0';

import FilledButton, {
  FilledButtonProps,
} from '../../components/buttons/FilledButton';
import { TableDownload, Download } from '../../components/icons';
import UIThemeProvider from '../../components/theming/UIThemeProvider';
import { blue, gray, green, orange, teal } from '../../definitions/colors';

export default {
  title: 'Controls/Buttons/FilledButton',
  component: FilledButton,
} as Meta;

const Template: Story<FilledButtonProps> = (args) => {
  return (
    <UIThemeProvider
      theme={{
        palette: {
          primary: { hue: green, level: 600 },
          secondary: { hue: orange, level: 500 },
        },
      }}
    >
      <FilledButton {...args} />
    </UIThemeProvider>
  );
};

export const Default = Template.bind({});
Default.args = {
  text: 'Hello Developer',
  size: 'medium',
};

export const WithIcon = Template.bind({});
WithIcon.args = {
  text: 'Button With Icon',
  icon: TableDownload,
};

export const Tooltip = Template.bind({});
Tooltip.args = {
  text: 'Button With Tooltip',
  icon: TableDownload,
  tooltip: 'Hello there friend.',
};

export const UseTheme = Template.bind({});
UseTheme.args = {
  text: 'Using Theme Styles',
  icon: Download,
  role: 'primary',
  size: 'medium',
};
