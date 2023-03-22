import { Story, Meta } from '@storybook/react/types-6-0';

import Chip, { ChipProps } from '../../components/widgets/Chip';
import { CloseCircle } from '../../components/icons';
import UIThemeProvider from '../../components/theming/UIThemeProvider';
import { mutedGreen, purple } from '../../definitions/colors';

export default {
  title: 'Controls/Widgets/Chip',
  component: Chip,
} as Meta;

const Template: Story<ChipProps> = (args) => {
  return (
    <UIThemeProvider
      theme={{
        palette: {
          primary: { hue: mutedGreen, level: 600 },
          secondary: { hue: purple, level: 500 },
        },
      }}
    >
      <Chip {...args} />
    </UIThemeProvider>
  );
};

export const Default = Template.bind({});
Default.args = {
  text: 'Indoor Ventilation',
} as ChipProps;

export const UseTheme = Template.bind({});
UseTheme.args = {
  ...Default.args,
  themeRole: 'primary',
} as ChipProps;

export const WithIcon = Template.bind({});
WithIcon.args = {
  ...Default.args,
  icon: CloseCircle,
} as ChipProps;

export const StaticState = Template.bind({});
StaticState.args = {
  ...Default.args,
  icon: CloseCircle,
  staticState: 'hover',
  onPress: null,
} as ChipProps;
