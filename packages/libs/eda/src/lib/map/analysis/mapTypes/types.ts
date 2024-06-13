import { Bounds as BoundsProp } from '@veupathdb/components/lib/map/Types';
import { ComponentType, SVGProps } from 'react';
import {
  AnalysisState,
  Filter,
  PromiseHookState,
  StudyEntity,
  StudyMetadata,
} from '../../../core';
import { EntityCounts } from '../../../core/hooks/entityCounts';
import { GeoConfig } from '../../../core/types/geoConfig';
import { VariableDescriptor } from '../../../core/types/variable';
import { ComputationAppOverview } from '../../../core/types/visualization';
import {
  AppState,
  MarkerConfiguration,
  PanelConfig,
  SiteInformationProps,
} from '../Types';

export interface MapTypeConfigPanelProps<T extends MarkerConfiguration> {
  apps: ComputationAppOverview[];
  analysisState: AnalysisState;
  appState: AppState;
  studyId: string;
  filters: Filter[] | undefined;
  studyEntities: StudyEntity[];
  geoConfigs: GeoConfig[];
  configuration: unknown;
  updateConfiguration: (configuration: T) => void;
  setIsSidePanelExpanded: (isExpanded: boolean) => void;
}

export interface MapTypeMapLayerProps<T extends MarkerConfiguration> {
  apps: ComputationAppOverview[];
  analysisState: AnalysisState;
  appState: AppState;
  studyId: string;
  filters: Filter[] | undefined;
  studyEntities: StudyEntity[];
  geoConfigs: GeoConfig[];
  configuration: unknown;
  updateConfiguration: (configuration: T) => void;
  totalCounts: PromiseHookState<EntityCounts>;
  filteredCounts: PromiseHookState<EntityCounts>;
  setSelectedMarkers?: React.Dispatch<React.SetStateAction<string[]>>;
  setStudyDetailsPanelConfig: (config: PanelConfig) => void;
  setTimeSliderConfig?: (
    newConfig: NonNullable<AppState['timeSliderConfig']>
  ) => void;
  siteInformationProps?: SiteInformationProps;
  headerButtons?: React.FC;
  // coordinates of selected area
  boxCoord?: BoundsProp;
}

/**
 * A plugin containing the pieces needed to render
 * and configure a map type
 */
export interface MapTypePlugin<T extends MarkerConfiguration> {
  /**
   * Unique identifier for the map type
   */
  type: T['type'];
  /**
   * Display name of map type used for menu, etc.
   */
  displayName: string;
  /**
   * Icon component
   */
  IconComponent: ComponentType<SVGProps<SVGSVGElement>>;
  /**
   * Returns a default configuration for this MapType. This is used to
   * create a set of default configurations for new analyses.
   */
  getDefaultConfig(props: {
    defaultVariable: VariableDescriptor;
    study: StudyMetadata;
  }): T;
  /**
   * Returns a ReactNode used for configuring the map type
   */
  ConfigPanelComponent: ComponentType<MapTypeConfigPanelProps<T>>;
  /**
   * Returns a ReactNode that is rendered as a leaflet map layer
   */
  MapLayerComponent?: ComponentType<MapTypeMapLayerProps<T>>;
  /**
   * Returns a ReactNode that is rendered on top of the map
   */
  MapOverlayComponent?: ComponentType<MapTypeMapLayerProps<T>>;
  /**
   * Returns a ReactNode that is rendered in the map header
   */
  MapTypeHeaderDetails?: ComponentType<MapTypeMapLayerProps<T>>;
  /**
   * Returns a ReactNode that is rendered under the map header
   */
  TimeSliderComponent?: ComponentType<MapTypeMapLayerProps<T>>;
}
