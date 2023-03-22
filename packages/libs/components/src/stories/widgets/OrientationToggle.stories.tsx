import React, { useEffect, useState } from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';

import OrientationToggle, {
  OrientationToggleProps,
} from '../../components/widgets/OrientationToggle';
import { OrientationOptions } from '../../types/plots';

export default {
  title: 'Widgets/Orientation Toggle',
  component: OrientationToggle,
} as Meta;

export const BasicOrientationToggle: Story<OrientationToggleProps> = (args) => {
  const [orientation, setOrientation] = useState<OrientationOptions>(
    args.orientation
  );

  // Play nice with storybook.
  useEffect(() => {
    setOrientation(args.orientation);
  }, [args.orientation]);

  return (
    <OrientationToggle
      orientation={orientation}
      onOrientationChange={() => {
        args.onOrientationChange(
          orientation === 'vertical' ? 'horizontal' : 'vertical'
        );
        setOrientation(orientation === 'vertical' ? 'horizontal' : 'vertical');
      }}
      containerStyles={{ ...args.containerStyles, padding: 25 }}
    />
  );
};
BasicOrientationToggle.args = {
  orientation: 'vertical',
};
BasicOrientationToggle.argTypes = {
  onOrientationChange: {
    action: 'Value Changed',
  },
};

export const CustomStyling = BasicOrientationToggle.bind({});
CustomStyling.args = {
  containerStyles: {
    padding: 10,
    borderRadius: 5,
    background:
      'linear-gradient(#ffffff, #ffffff), linear-gradient(to right, red, purple)',
    backgroundOrigin: 'padding-box, border-box',
    backgroundRepeat: 'no-repeat' /* this is important */,
    border: '2px solid transparent',
    maxWidth: 200,
  },
  orientation: 'horizontal',
};
CustomStyling.argTypes = {
  onOrientationChange: {
    action: 'Value Changed',
  },
};
