import * as t from 'io-ts';
import { ReactNode } from 'react';
import { ComputationAppOverview } from '../../core/types/visualization';
import { VariableDescriptor } from '../../core/types/variable';

export type SidePanelMenuEntry =
  | SidePanelItem
  | SidePanelHeading
  | SidePanelSubheading;

export interface SidePanelMenuItemBase {
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  labelText: ReactNode;
}

export interface SidePanelItem extends SidePanelMenuItemBase {
  type: 'item';
  id: string;
  renderSidePanelDrawer: (apps: ComputationAppOverview[]) => ReactNode;
  onActive?: () => void;
}

export interface SidePanelHeading extends SidePanelMenuItemBase {
  type: 'heading';
  children: (SidePanelSubheading | SidePanelItem)[];
}

export interface SidePanelSubheading extends SidePanelMenuItemBase {
  type: 'subheading';
  children: SidePanelItem[];
}

export interface SiteInformationProps {
  siteHomeUrl: string;
  loginUrl: string;
  siteName: string;
  siteLogoSrc: string;
}

export const PanelPositionConfig = t.type({
  x: t.number,
  y: t.number,
});

export const PanelConfig = t.intersection([
  t.type({
    isVisible: t.boolean,
    position: PanelPositionConfig,
    dimensions: t.type({
      height: t.union([t.number, t.string]),
      width: t.union([t.number, t.string]),
    }),
  }),
  t.partial({
    hideVizControl: t.boolean,
  }),
]);

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type PanelConfig = t.TypeOf<typeof PanelConfig>;

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type PanelPositionConfig = t.TypeOf<typeof PanelPositionConfig>;

const LatLngLiteral = t.type({ lat: t.number, lng: t.number });

export type MarkerConfiguration = t.TypeOf<typeof MarkerConfiguration>;
// TODO Make `uknown` and use plugin-specific decoder
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const MarkerConfiguration = t.intersection([
  t.type({
    type: t.string,
  }),
  t.partial({
    selectedMarkers: t.array(t.string),
    selectedVariable: VariableDescriptor,
    activeVisualizationId: t.string,
    geoEntityId: t.string,
  }),
]);

export type LegacyRedirectState = t.TypeOf<typeof LegacyRedirectState>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const LegacyRedirectState = t.union([
  t.undefined,
  t.type({
    projectId: t.union([t.string, t.undefined]),
    showLegacyMapRedirectModal: t.boolean,
  }),
]);

export const AppState = t.intersection([
  t.type({
    viewport: t.type({
      center: t.tuple([t.number, t.number]),
      zoom: t.number,
    }),
    activeMarkerConfigurationType: t.string,
    markerConfigurations: t.array(MarkerConfiguration),
    isSidePanelExpanded: t.boolean,
  }),
  t.partial({
    studyDetailsPanelConfig: PanelConfig,
    boundsZoomLevel: t.type({
      zoomLevel: t.number,
      bounds: t.type({
        southWest: LatLngLiteral,
        northEast: LatLngLiteral,
      }),
    }),
    subsetVariableAndEntity: t.partial({
      entityId: t.string,
      variableId: t.string,
    }),
    isSubsetPanelOpen: t.boolean,
    timeSliderConfig: t.type({
      variable: t.union([VariableDescriptor, t.undefined]),
      selectedRange: t.union([
        t.type({
          start: t.string,
          end: t.string,
        }),
        t.undefined,
      ]),
      active: t.boolean,
    }),
  }),
]);

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type AppState = t.TypeOf<typeof AppState>;
