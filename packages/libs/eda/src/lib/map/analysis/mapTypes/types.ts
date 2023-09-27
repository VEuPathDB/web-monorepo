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
import { DataClient, SubsettingClient } from '../../../core/api';
import { EntityCounts } from '../../../core/hooks/entityCounts';
import { BoundsViewport } from '@veupathdb/components/lib/map/Types';

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
  filtersIncludingViewport: Filter[];
}

export interface GetDataProps {
  dataClient: DataClient;
  subsettingClient: SubsettingClient;
  boundsZoomLevel: BoundsViewport;
  studyId: string;
  filters: Filter[] | undefined;
  studyEntities: StudyEntity[];
  geoConfigs: GeoConfig[];
  configuration: unknown;
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
}
