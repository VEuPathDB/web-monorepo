import { Story, Meta } from '@storybook/react/types-6-0';

import FloatingButton, {
  FloatingButtonProps,
} from '../../components/buttons/FloatingButton';
import { TableDownload, Download } from '../../components/icons';
import UIThemeProvider from '../../components/theming/UIThemeProvider';
import { green, orange } from '../../definitions/colors';

export default {
  title: 'Controls/Buttons/FloatingButton',
  component: FloatingButton,
} as Meta;

const Template: Story<FloatingButtonProps> = (args) => {
  return (
    <UIThemeProvider
      theme={{
        palette: {
          primary: { hue: green, level: 700 },
          secondary: { hue: orange, level: 500 },
        },
      }}
    >
      <FloatingButton {...args} />
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
  themeRole: 'primary',
  size: 'medium',
};
