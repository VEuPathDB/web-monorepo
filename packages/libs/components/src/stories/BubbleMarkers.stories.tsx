import React, { ReactElement, useState, useCallback, useEffect } from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';
// import { action } from '@storybook/addon-actions';
import { BoundsViewport } from '../map/Types';
import { BoundsDriftMarkerProps } from '../map/BoundsDriftMarker';
import { defaultAnimationDuration } from '../map/config/map';
import { leafletZoomLevelToGeohashLevel } from '../map/utils/leaflet-geohash';
import {
  getSpeciesDonuts,
  getSpeciesBasicMarkers,
} from './api/getMarkersFromFixtureData';

import { LeafletMouseEvent } from 'leaflet';
import { Viewport } from '../map/MapVEuMap';

// sidebar & legend
import MapVEuMap, { MapVEuMapProps } from '../map/MapVEuMap';
import geohashAnimation from '../map/animation_functions/geohash';
import { MouseMode } from '../map/MouseTools';

import BubbleMarker, {
  BubbleMarkerProps,
  BubbleMarkerStandalone,
} from '../map/BubbleMarker';

export default {
  title: 'Map/Bubble Markers',
} as Meta;

export const Standalone: Story<MapVEuMapProps> = () => {
  return (
    <div>
      <BubbleMarkerStandalone
        data={{
          size: 10,
          color: 'yellow',
        }}
        isAtomic={false}
        markerScale={1}
        containerStyles={{ margin: '10px' }}
      />
      <BubbleMarkerStandalone
        data={{
          size: 85,
          color: 'pink',
        }}
        isAtomic={false}
        markerScale={1}
        containerStyles={{ margin: '10px' }}
      />
      <BubbleMarkerStandalone
        data={{
          size: 100,
          color: 'lightblue',
        }}
        isAtomic={false}
        markerScale={1}
        containerStyles={{ margin: '10px' }}
      />
    </div>
  );
};
