import { Story, Meta } from '@storybook/react/types-6-0';
import { SwissArmyButtonVariantProps } from '../../components/buttons';

import FloatingButton from '../../components/buttons/FloatingButton';
import { TableDownload, Download, Undo } from '../../components/icons';
import UIThemeProvider from '../../components/theming/UIThemeProvider';
import { green, orange } from '../../definitions/colors';

import { AccessAlarm } from '@material-ui/icons';

export default {
  title: 'Controls/Buttons/FloatingButton',
  component: FloatingButton,
} as Meta;

const Template: Story<SwissArmyButtonVariantProps> = (args) => {
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
  textTransform: 'uppercase',
  size: 'medium',
  disabled: false,
  themeRole: undefined,
} as SwissArmyButtonVariantProps;

export const WithIcon = Template.bind({});
WithIcon.args = {
  ...Default.args,
  text: 'Button With Icon',
  icon: TableDownload,
} as SwissArmyButtonVariantProps;

export const WithMaterialIcon = Template.bind({});
WithMaterialIcon.args = {
  ...Default.args,
  text: 'Button With Icon',
  icon: AccessAlarm,
} as SwissArmyButtonVariantProps;

export const IconOnly = Template.bind({});
IconOnly.args = {
  ...Default.args,
  text: undefined,
  icon: Undo,
} as SwissArmyButtonVariantProps;

export const Tooltip = Template.bind({});
Tooltip.args = {
  ...Default.args,
  text: 'Button With Tooltip',
  icon: TableDownload,
  tooltip: 'Hello there friend.',
} as SwissArmyButtonVariantProps;

export const UseTheme = Template.bind({});
UseTheme.args = {
  ...Default.args,
  text: 'Using Theme Styles',
  icon: Download,
  themeRole: 'primary',
} as SwissArmyButtonVariantProps;

export const NoTextTransform = Template.bind({});
NoTextTransform.args = {
  text: 'Hello Developer',
  textTransform: 'none',
  size: 'medium',
  icon: TableDownload,
  disabled: false,
  themeRole: undefined,
} as SwissArmyButtonVariantProps;
