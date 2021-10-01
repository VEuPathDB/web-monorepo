import { Story, Meta } from '@storybook/react/types-6-0';

import SwissArmyButton, {
  SwissArmyButtonProps,
} from '../components/buttons/SwissArmyButton';
import { DARK_ORANGE, LIGHT_GREEN } from '../constants/colors';

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
  icon: 'download',
  type: 'outlined',
};

export const StylePreset = Template.bind({});
StylePreset.args = {
  text: 'Mesa Style Preset',
  icon: 'download',
  stylePreset: 'mesa',
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
