import * as t from 'io-ts';
import { baseLayers } from '@veupathdb/components/lib/map/MapVEuMap';

/**
 * Map UI state for the GeoCoordFilter, stored in the analysis' variable
 * UI settings under a key shared by an entity's latitude and longitude
 * variables (`${entityId}/${latitudeVariableId}/${longitudeVariableId}`),
 * so the map looks the same whichever of the two is selected. Studies
 * with several geo-enabled entities get one independent entry each.
 *
 * `selectedShapes` holds the user's lasso shapes as-drawn ([lat, lng]
 * vertices per shape). The shapes are the editable source of the
 * derived stringPrefixSet filter, which carries only geohash prefixes.
 */
export type GeoCoordUIState = t.TypeOf<typeof GeoCoordUIState>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const GeoCoordUIState = t.intersection([
  t.type({
    mapCenterAndZoom: t.type({
      latitude: t.number,
      longitude: t.number,
      zoomLevel: t.number,
    }),
  }),
  t.partial({
    baseLayer: t.keyof(baseLayers),
    selectedShapes: t.array(t.array(t.tuple([t.number, t.number]))),
  }),
]);

export const defaultGeoCoordUIState: GeoCoordUIState = {
  mapCenterAndZoom: {
    latitude: 0,
    longitude: 0,
    zoomLevel: 1,
  },
};
