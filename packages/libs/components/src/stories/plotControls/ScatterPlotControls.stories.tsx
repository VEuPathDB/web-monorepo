import { Story, Meta } from '@storybook/react/types-6-0';

import ScatterPlotControls from '../../components/plotControls/ScatterPlotControls';
import usePlotControls, {
  usePlotControlsParams,
} from '../../hooks/usePlotControls';

export default {
  title: 'Plot Controls/ScatterPlot',
  component: ScatterPlotControls,
} as Meta;

export const Basic: Story<usePlotControlsParams<any>> = (args) => {
  const controls = usePlotControls<any>({
    data: args.data,
    ScatterPlot: args.ScatterPlot,
  });

  return (
    <ScatterPlotControls
      // label="ScatterPlot Control Panel"
      {...controls}
      {...controls.ScatterPlot}
      // assign new props' values for tests
      label={'Plot modes'}
      orientation={'horizontal'}
      labelPlacement={'end'}
      // minWidth={235}
      buttonColor={'primary'}
      margins={['5em', '0', '0', '5em']}
      itemMarginRight={50}
      plotOptions={['Raw', 'Smoothed mean with raw', 'Best fit line with raw']}
    />
  );
};

Basic.args = {
  data: { series: [{ name: 'dummy data', bins: [] }] },
  ScatterPlot: {
    valueSpec: 'Raw',
  },
};
