import { ComponentType, CSSProperties } from 'react';
import { AnalysisState, Filter, StudyEntity } from '../../../core';
import { GeoConfig } from '../../../core/types/geoConfig';
import { VariableDescriptor } from '../../../core/types/variable';
import { ComputationAppOverview } from '../../../core/types/visualization';
import { AppState, MarkerType } from '../appState';
import { SiteInformationProps } from '../Types';
import { LittleFilterFunc } from '../littleFilters';
import { Bounds } from '@veupathdb/components/lib/map/Types';
import { MarkerSelectionGesture } from '@veupathdb/components/lib/map/BoundsDriftMarker';

/** What the map needs to know about a rendered marker (a geohash cell). */
export interface MarkerSummary {
  /** the geohash of the cell */
  id: string;
  /** average position of the records in the cell */
  position: { lat: number; lng: number };
  /** extent of the records in the cell */
  bounds: Bounds;
}

/** Selection plumbing handed to each map type's marker layer. */
export interface MapSelectionProps {
  /** the selection, as geohash prefixes (see utils/geohashSelection) */
  prefixes: string[];
  onSelectionGesture: (
    markerIds: string[],
    gesture: MarkerSelectionGesture
  ) => void;
  /** right-click on a marker */
  onMarkerContextMenu: (marker: MarkerSummary) => void;
  /** true while the lasso tool is armed */
  lassoActive: boolean;
  onLassoDeactivated: () => void;
  /** reports the markers currently drawn, for the selection panel */
  onMarkersRendered: (markers: MarkerSummary[]) => void;
}

interface MapTypeSharedProps {
  apps: ComputationAppOverview[];
  analysisState: AnalysisState;
  appState: AppState;
  studyId: string;
  filters: Filter[] | undefined;
  studyEntities: StudyEntity[];
  geoConfigs: GeoConfig[];
  /** the location entity's geo configuration: markers are placed by it */
  geoConfig: GeoConfig;
  /** this map type's marker configuration (narrowed by each plugin) */
  configuration: unknown;
  updateConfiguration: (configuration: unknown) => void;
}

export interface MapTypeConfigPanelProps extends MapTypeSharedProps {
  /**
   * Variables that cannot be shown on markers placed by the location
   * entity (they are not on its ancestor/descendant lineage).
   */
  disabledVariables: VariableDescriptor[];
}

/**
 * Fit the map to the markers once, when an analysis is opened at the
 * default (never moved) view. `onStarted` must switch `pending` off: the
 * fit is a one-shot, never repeated on later re-renders or data changes.
 */
export interface InitialFitProps {
  pending: boolean;
  onStarted: () => void;
}

export interface MapTypeMapLayerProps extends MapTypeSharedProps {
  selection: MapSelectionProps;
  initialFit: InitialFitProps;
}

export type MapTypeLegendProps = MapTypeSharedProps;

export interface MapTypeTimeSliderProps extends MapTypeSharedProps {
  setTimeSliderConfig: (
    newConfig: NonNullable<AppState['timeSliderConfig']>
  ) => void;
  siteInformationProps: SiteInformationProps;
}

/**
 * A plugin containing the pieces needed to render and configure a map type.
 */
export interface MapTypePlugin {
  type: MarkerType;
  /** Display name of map type used for menu, etc. */
  displayName: string;
  /** small icon for the map type switcher */
  Icon: ComponentType<{ style?: CSSProperties }>;
  /** marker settings, shown in the map settings panel */
  ConfigPanelComponent: ComponentType<MapTypeConfigPanelProps>;
  /** rendered as a leaflet map layer */
  MapLayerComponent: ComponentType<MapTypeMapLayerProps>;
  /** the body of the on-map legend */
  LegendComponent: ComponentType<MapTypeLegendProps>;
  /** the time slider quick filter */
  TimeSliderComponent: ComponentType<MapTypeTimeSliderProps>;
  /**
   * The marker configuration's little filters: by default "has a value for
   * the marker variable", narrowed to the chosen values when the markers are
   * custom-configured. Used for the timeline's bars and the map count. Must
   * be a stable (module-level) array.
   */
  markerConfigFilterFuncs: LittleFilterFunc[];
}
