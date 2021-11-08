import { Story, Meta } from '@storybook/react/types-6-0';

import SwissArmyButton, {
  SwissArmyButtonProps,
} from '../components/buttons/SwissArmyButton';
import { TableDownload, Download } from '../components/icons';
import { DARK_ORANGE, LIGHT_GREEN } from '../definitions/colors';

export default {
  title: 'Controls/SwissArmyButton',
  component: SwissArmyButton,
} as Meta;

const Template: Story<SwissArmyButtonProps> = (args) => (
  <SwissArmyButton {...args} />
);
export const Default = Template.bind({});
Default.args = {
  text: 'Hello Developer',
};

export const Outlined = Template.bind({});
Outlined.args = {
  text: 'Outlined Button',
  type: 'outlined',
};

export const WithIcon = Template.bind({});
WithIcon.args = {
  text: 'Button With Icon',
  icon: TableDownload,
  type: 'outlined',
};

export const Tooltip = Template.bind({});
Tooltip.args = {
  text: 'Button With Tooltip',
  icon: TableDownload,
  type: 'outlined',
  tooltip: 'Hello there friend.',
};

export const MesaStylePreset = Template.bind({});
MesaStylePreset.args = {
  text: 'Mesa Style Preset',
  icon: Download,
  stylePreset: 'mesa',
};

export const BorderlessStylePreset = Template.bind({});
BorderlessStylePreset.args = {
  text: 'Borderless',
  icon: Download,
  stylePreset: 'borderless',
};

// export const CustomColors: Story<Omit<SwissArmyButtonProps, 'type'>> = (
//   args
// ) => (
//   <div
//     css={{
//       display: 'flex',
//       flexDirection: 'column',
//       justifyContent: 'space-between',
//       maxWidth: 200,
//     }}
//   >
//     <SwissArmyButton {...args} styleOverrides={{ marginBottom: 10 }} />
//     <SwissArmyButton {...args} type='outlined' />
//   </div>
// );
// CustomColors.args = {
//   text: 'Customized Colors',
//   color: LIGHT_GREEN,
//   pressedColor: DARK_ORANGE,
// };
// CustomColors.argTypes = {
//   type: {
//     control: {
//       type: null,
//     },
//   },
// };
