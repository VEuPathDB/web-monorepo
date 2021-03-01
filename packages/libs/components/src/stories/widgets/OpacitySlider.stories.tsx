import React, { useState } from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';

import { LIGHT_GREEN } from '../../constants/colors';
import OpacitySlider, {
  OpacitySliderProps,
} from '../../components/widgets/OpacitySlider';

export default {
  title: 'Widgets/Slider/Opacity',
  component: OpacitySlider,
} as Meta;

export const Basic: Story<OpacitySliderProps> = (args) => {
  const [opacity, setOpacity] = useState<number>(args.value);
  return (
    <OpacitySlider
      value={opacity}
      onValueChange={(value) => {
        args.onValueChange(value);
        setOpacity(value);
      }}
      color={args.color}
      containerStyles={{ ...args.containerStyles, padding: 25 }}
    />
  );
};
Basic.args = {
  value: 1,
  containerStyles: { width: 250 },
  color: LIGHT_GREEN,
};
Basic.argTypes = {
  onValueChange: {
    action: 'Opacity Value Changed',
  },
};
