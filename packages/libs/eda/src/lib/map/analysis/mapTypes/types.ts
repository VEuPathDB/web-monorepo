import { ComponentType } from 'react';
import {
  AnalysisState,
  Filter,
  PromiseHookState,
  StudyEntity,
} from '../../../core';
import { GeoConfig } from '../../../core/types/geoConfig';
import { ComputationAppOverview } from '../../../core/types/visualization';
import { AppState } from '../appState';
import { EntityCounts } from '../../../core/hooks/entityCounts';
import { SiteInformationProps } from '../Types';

// should we just use one type: MapTypeMapLayerProps?
// and get rid of this one?
export interface MapTypeConfigPanelProps {
  apps: ComputationAppOverview[];
  analysisState: AnalysisState;
  appState: AppState;
  studyId: string;
  filters: Filter[] | undefined;
  studyEntities: StudyEntity[];
  geoConfigs: GeoConfig[];
  configuration: unknown;
  updateConfiguration: (configuration: unknown) => void;
  hideVizInputsAndControls: boolean;
  setHideVizInputsAndControls: (hide: boolean) => void;
}

export interface MapTypeMapLayerProps {
  apps: ComputationAppOverview[];
  analysisState: AnalysisState;
  appState: AppState;
  studyId: string;
  filters: Filter[] | undefined;
  studyEntities: StudyEntity[];
  geoConfigs: GeoConfig[];
  configuration: unknown;
  updateConfiguration: (configuration: unknown) => void;
  totalCounts: PromiseHookState<EntityCounts>;
  filteredCounts: PromiseHookState<EntityCounts>;
  hideVizInputsAndControls: boolean;
  setHideVizInputsAndControls: (hide: boolean) => void;
  setTimeSliderConfig?: (
    newConfig: NonNullable<AppState['timeSliderConfig']>
  ) => void;
  siteInformationProps?: SiteInformationProps;
  headerButtons?: React.FC;
}

/**
 * A plugin containing the pieces needed to render
 * and configure a map type
 */
export interface MapTypePlugin {
  /**
   * Display name of map type used for menu, etc.
   */
  displayName: string;
  /**
   * Returns a ReactNode used for configuring the map type
   */
  ConfigPanelComponent: ComponentType<MapTypeConfigPanelProps>;
  /**
   * Returns a ReactNode that is rendered as a leaflet map layer
   */
  MapLayerComponent?: ComponentType<MapTypeMapLayerProps>;
  /**
   * Returns a ReactNode that is rendered on top of the map
   */
  MapOverlayComponent?: ComponentType<MapTypeMapLayerProps>;
  /**
   * Returns a ReactNode that is rendered in the map header
   */
  MapTypeHeaderDetails?: ComponentType<MapTypeMapLayerProps>;
  /**
   * Returns a ReactNode that is rendered under the map header
   */
  TimeSliderComponent?: ComponentType<MapTypeMapLayerProps>;
}
