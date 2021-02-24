import React from 'react';
import { Story } from '@storybook/react/types-6-0';

import PiePlot, { PiePlotProps } from '../../plots/PiePlot';
import { PiePlotData } from '../../types/plots';
import {
  DARK_GRAY,
  DARK_GREEN,
  DARK_ORANGE,
  LIGHT_BLUE,
  LIGHT_GREEN,
  LIGHT_ORANGE,
  LIGHT_PURPLE,
  LIGHT_RED,
  LIGHT_YELLOW,
} from '../../constants/colors';
import usePlotControls from '../../hooks/usePlotControls';
import PieControls from '../../components/plotControls/PieControls';

export default {
  title: 'Plots/Pie & Donut',
  component: PiePlot,
  parameters: {
    redmine: 'https://redmine.apidb.org/issues/41799',
  },
};

let data: PiePlotData = {
  slices: [
    {
      value: 10,
      label: 'Foo',
    },
    {
      value: 2,
      label: 'Bar',
    },
    {
      value: 30,
      label: 'Baz',
    },
  ],
};

let coloredData: PiePlotData = {
  slices: [
    {
      value: 10,
      label: 'Light Green',
      color: LIGHT_GREEN,
    },
    {
      value: 2,
      label: 'Dark Green',
      color: DARK_GREEN,
    },
    {
      value: 30,
      color: LIGHT_BLUE,
      label: 'Light Blue',
    },
  ],
};

let dataWithAvailableUnits: PiePlotData = {
  slices: [
    {
      value: 10,
      label: 'Purple',
      color: LIGHT_PURPLE,
    },
    {
      value: 2,
      label: 'Green',
      color: LIGHT_GREEN,
    },
    {
      value: 30,
      color: LIGHT_BLUE,
      label: 'Blue',
    },
  ],
  availableUnits: ['Not Yet', 'Implemented'],
  selectedUnit: 'Not Yet',
};

const NoControlsTemplate: Story<PiePlotProps> = (args) => <PiePlot {...args} />;

export const Basic = NoControlsTemplate.bind({});
Basic.args = {
  data: data,
  width: 600,
  height: 450,
  title: 'Pie Plot',
  legendOptions: {
    horizontalPosition: 'right',
    horizontalPaddingAdjustment: 0.1,
    verticalPosition: 'top',
    verticalPaddingAdjustment: 0,
    orientation: 'vertical',
  },
  spacingOptions: {
    marginBottom: 80,
    marginLeft: 50,
    marginRight: 80,
    marginTop: 100,
    padding: 0,
  },
};

export const CustomSliceColors = NoControlsTemplate.bind({});
CustomSliceColors.args = {
  ...Basic.args,
  data: coloredData,
  title: 'Pie Plot w/ Custom Colors',
};

export const BasicDonut = NoControlsTemplate.bind({});
BasicDonut.args = {
  ...Basic.args,
  title: 'Basic Donut Plot',
  donutOptions: {
    size: 0.3,
  },
};

export const DonutText = NoControlsTemplate.bind({});
DonutText.args = {
  ...Basic.args,
  title: 'Donut Plot w/Text',
  donutOptions: {
    size: 0.4,
    text: 'Donut Text',
  },
};

export const FilledDonut = NoControlsTemplate.bind({});
FilledDonut.args = {
  ...Basic.args,
  title: 'Filled Donut',
  donutOptions: {
    size: 0.4,
    backgroundColor: DARK_GRAY,
    text: 'Text',
    textColor: 'white',
  },
};

export const BasicControlPanel: Story<PiePlotProps> = (args) => {
  const plotControls = usePlotControls<PiePlotData>({ data: args.data });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', margin: 25 }}>
      <PiePlot
        {...args}
        spacingOptions={{
          marginBottom: 0,
          marginLeft: 0,
          marginRight: 0,
          marginTop: 10,
        }}
        {...plotControls}
      />
      <div style={{ height: 25 }} />
      <PieControls
        label="Pie Plot Controls"
        {...plotControls}
        containerStyles={{
          maxWidth: args.width,
        }}
      />
    </div>
  );
};

BasicControlPanel.args = {
  data: coloredData,
  width: 500,
  height: 300,
};

export const ControlPanelWithAvailableUnits: Story<PiePlotProps> = (args) => {
  const plotControls = usePlotControls<PiePlotData>({
    data: args.data,
    onSelectedUnitChange: async (unit) => {
      return args.data;
    },
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', margin: 25 }}>
      <PiePlot
        {...args}
        spacingOptions={{
          marginBottom: 0,
          marginLeft: 0,
          marginRight: 0,
          marginTop: 10,
        }}
        {...plotControls}
      />
      <div style={{ height: 25 }} />
      <PieControls
        label="Pie Plot Controls W/ Available Units"
        {...plotControls}
        containerStyles={{
          maxWidth: args.width,
        }}
      />
    </div>
  );
};

ControlPanelWithAvailableUnits.args = {
  data: dataWithAvailableUnits,
  width: 500,
  height: 300,
};
