import { Story, Meta } from '@storybook/react/types-6-0';

import XYPlotControls from '../../components/plotControls/XYPlotControls';
import usePlotControls, {
  usePlotControlsParams,
} from '../../hooks/usePlotControls';

export default {
  title: 'Plot Controls/Scatterplot',
  component: XYPlotControls,
} as Meta;

export const BasicControls: Story<usePlotControlsParams<any>> = (args) => {
  const controls = usePlotControls<any>({
    data: args.data,
    scatterplot: args.scatterplot,
  });

  return (
    <XYPlotControls
      // label="Scatter Plot Control Panel"
      {...controls}
      {...controls.scatterplot}
    />
  );
};

BasicControls.args = {
  data: { series: [{ name: 'dummy data', bins: [] }] },
  scatterplot: {
    valueSpec: 'Raw',
  },
};
