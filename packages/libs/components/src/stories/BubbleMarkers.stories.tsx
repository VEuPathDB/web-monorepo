import React from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';

import { MapVEuMapProps } from '../map/MapVEuMap';

import { BubbleMarkerStandalone } from '../map/BubbleMarker';

export default {
  title: 'Map/Bubble Markers',
} as Meta;

const valueToDiameterMapper = (value: number) => {
  // Area scales directly with value
  const constant = 100;
  const area = value * constant;
  const radius = Math.sqrt(area / Math.PI);

  // Radius scales with log_10 of value
  // const constant = 20;
  // const radius = Math.log10(value) * constant;

  // Radius scales directly with value
  // const largestCircleSize = 150;
  // const constant = maxValue / largestCircleSize;
  // const radius = value * constant;

  return 2 * radius;
};

export const Standalone: Story<MapVEuMapProps> = () => {
  return (
    <div>
      <BubbleMarkerStandalone
        data={{
          value: 10,
          diameter: valueToDiameterMapper(10),
          color: 'yellow',
        }}
        isAtomic={false}
        // markerScale={1}
        containerStyles={{ margin: '10px' }}
      />
      <BubbleMarkerStandalone
        data={{
          value: 85,
          diameter: valueToDiameterMapper(85),
          color: 'pink',
        }}
        isAtomic={false}
        // markerScale={1}
        containerStyles={{ margin: '10px' }}
      />
      <BubbleMarkerStandalone
        data={{
          value: 100,
          diameter: valueToDiameterMapper(100),
          color: 'lightblue',
        }}
        isAtomic={false}
        // markerScale={1}
        containerStyles={{ margin: '10px' }}
      />
    </div>
  );
};
