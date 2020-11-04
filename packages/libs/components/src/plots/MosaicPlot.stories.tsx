import React from 'react';
import MosaicPlot from './MosaicPlot';

export default {
  title: 'MosaicPlot',
  component: MosaicPlot,
};

export const Basic = () => <MosaicPlot
  data={[
    [ 40, 15 ],
    [ 10, 35 ]
  ]}
  exposureValues={[ 'Men', 'Women' ]}
  outcomeValues={[ 'Died', 'Survived' ]}
  exposureLabel={'Sex'}
  outcomeLabel={'Status'}
  widths={[ 40, 10 ]}
  colors={[ 'red', 'yellow' ]}
/>
