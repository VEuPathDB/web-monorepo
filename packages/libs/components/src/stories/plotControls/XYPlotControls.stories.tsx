import { Story, Meta } from '@storybook/react/types-6-0';

import XYPlotControls from '../../components/plotControls/XYPlotControls';
import usePlotControls, {
  usePlotControlsParams,
} from '../../hooks/usePlotControls';

export default {
  title: 'Plot Controls/XYPlot',
  component: XYPlotControls,
} as Meta;

export const Basic: Story<usePlotControlsParams<any>> = (args) => {
  const controls = usePlotControls<any>({
    data: args.data,
    XYPlot: args.XYPlot,
  });

  return (
    <XYPlotControls
      // label="XYPlot Control Panel"
      {...controls}
      {...controls.XYPlot}
      // assign new props' values for tests
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
  XYPlot: {
    valueSpec: 'Raw',
  },
};
