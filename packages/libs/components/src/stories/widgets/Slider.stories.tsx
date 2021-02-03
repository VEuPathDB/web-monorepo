import React, { useState, useEffect } from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';

import SliderWidget, {
  SliderWidgetProps,
} from '../../components/widgets/Slider';
import {
  LIGHT_GREEN,
  LIGHT_ORANGE,
  LIGHT_PURPLE,
  LIGHT_RED,
  LIGHT_YELLOW,
  MEDIUM_GRAY,
} from '../../constants/colors';

export default {
  title: 'Widgets/Slider',
  component: SliderWidget,
} as Meta;

const Template: Story<SliderWidgetProps> = (args) => {
  const [value, setValue] = useState<number>(args.value);

  // Play nice with Storybook controls.
  useEffect(() => {
    setValue(args.value);
  }, [args.value]);

  return (
    <SliderWidget
      {...args}
      value={value}
      onChange={(value) => {
        args.onChange(value);
        setValue(value);
      }}
    />
  );
};

export const Basic = Template.bind({});
Basic.args = {
  minimum: 0,
  maximum: 255,
  value: 1,
  containerStyles: { width: 150, paddingTop: 35, paddingLeft: 10 },
};
Basic.argTypes = {
  onChange: {
    action: 'Slider Value Changed',
  },
};

export const Labelled = Template.bind({});
Labelled.args = {
  ...Basic.args,
  containerStyles: { width: 150, paddingTop: 5 },
  label: 'Widget Label',
};
Labelled.argTypes = { ...Basic.argTypes };

export const FormattedTooltip = Template.bind({});
FormattedTooltip.args = {
  ...Labelled.args,
  valueFormatter: (value) => `#${value}`,
};
FormattedTooltip.argTypes = { ...Basic.argTypes };

export const CustomColors = Template.bind({});
CustomColors.args = {
  ...Labelled.args,
  label: 'Widget Label',
  colorSpec: {
    type: 'singleColor',
    trackColor: LIGHT_YELLOW,
    knobColor: LIGHT_ORANGE,
    tooltip: LIGHT_PURPLE,
  },
};
CustomColors.argTypes = { ...Basic.argTypes };

export const CustomGradientColors = Template.bind({});
CustomGradientColors.args = {
  ...Labelled.args,
  label: 'Widget Label',
  colorSpec: {
    type: 'gradient',
    trackGradientStart: LIGHT_GREEN,
    trackGradientEnd: LIGHT_RED,
    knobColor: MEDIUM_GRAY,
    tooltip: LIGHT_PURPLE,
  },
};
CustomGradientColors.argTypes = { ...Basic.argTypes };
