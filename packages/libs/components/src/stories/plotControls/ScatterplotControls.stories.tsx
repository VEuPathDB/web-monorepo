import { Story, Meta } from '@storybook/react/types-6-0';

import ScatterplotControls from '../../components/plotControls/ScatterplotControls';
import usePlotControls, {
  usePlotControlsParams,
} from '../../hooks/usePlotControls';

export default {
  title: 'Plot Controls/Scatterplot',
  component: ScatterplotControls,
} as Meta;

export const BasicControls: Story<usePlotControlsParams<any>> = (args) => {
  const controls = usePlotControls<any>({
    data: args.data,
    scatterplot: args.scatterplot,
  });

  return (
    <ScatterplotControls
      label="Scatter Plot Control Panel"
      {...controls}
      {...controls.scatterplot}
    />
  );
};

BasicControls.args = {
  data: { series: [{ name: 'dummy data', bins: [] }] },
  scatterplot: {
    valueSpec: 'raw',
  },
};
