import { Story, Meta } from '@storybook/react/types-6-0';
import { SwissArmyButtonVariantProps } from '../../components/buttons';

import MesaButton from '../../components/buttons/MesaButton';
import { TableDownload, Download } from '../../components/icons';
import UIThemeProvider from '../../components/theming/UIThemeProvider';
import { blue, orange } from '../../definitions/colors';

export default {
  title: 'Controls/Buttons/MesaButton',
  component: MesaButton,
} as Meta;

const Template: Story<SwissArmyButtonVariantProps> = (args) => {
  return (
    <UIThemeProvider
      theme={{
        palette: {
          primary: { hue: blue, level: 500 },
          secondary: { hue: orange, level: 500 },
        },
      }}
    >
      <MesaButton {...args} />
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

export const IconOnly = Template.bind({});
IconOnly.args = {
  iconOnly: true,
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
