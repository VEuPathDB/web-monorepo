import React from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';

import PieControls from '../../components/plotControls/PieControls';
import usePlotControls, {
  usePlotControlsParams,
} from '../../hooks/usePlotControls';
import { PiePlotData } from '../../types/plots';
import { LIGHT_PURPLE } from '../../constants/colors';
import { mutedPurple } from '@veupathdb/coreui/lib/definitions/colors';

export default {
  title: 'Plot Controls/PieControls',
  component: PieControls,
} as Meta;

export const RequiredControls: Story<usePlotControlsParams<PiePlotData>> = (
  args
) => {
  const controls = usePlotControls<PiePlotData>({
    data: args.data,
  });

  return (
    <PieControls
      {...controls}
      {...controls.histogram}
      containerStyles={{ margin: 25 }}
    />
  );
};

RequiredControls.args = {
  data: { slices: [] },
};

export const AdditionalOptions: Story<usePlotControlsParams<PiePlotData>> = (
  args
) => {
  const controls = usePlotControls<PiePlotData>({
    data: args.data,
    onSelectedUnitChange: args.onSelectedUnitChange,
  });

  return (
    <PieControls
      label="Customizable Pie Plot Panel"
      accentColor={{ hue: mutedPurple, level: 400 }}
      {...controls}
      containerStyles={{ margin: 25 }}
    />
  );
};

AdditionalOptions.args = {
  data: {
    slices: [{ label: 'dummy value', value: 1 }],
    availableUnits: ['Celsius', 'Farenheit'],
    selectedUnit: 'Celsius',
  },
  onSelectedUnitChange: async (unit) => {
    return {
      slices: [{ label: 'dummy value', value: 1 }],
    };
  },
};
