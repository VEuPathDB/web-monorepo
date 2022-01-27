import { EntityCounts } from '../../hooks/entityCounts';
import { PromiseHookState } from '../../hooks/promise';
import { Filter } from '../../types/filter';
import { GeoConfig } from '../../types/geoConfig';
import { StudyMetadata } from '../../types/study';
import { VariableDescriptor } from '../../types/variable';
import {
  Computation,
  DataElementConstraint,
  Visualization,
  VisualizationOverview,
} from '../../types/visualization';

/**
 * Props passed to viz components
 */
export interface VisualizationProps {
  visualization: Visualization;
  dataElementConstraints?: Record<string, DataElementConstraint>[];
  dataElementDependencyOrder?: string[];
  updateConfiguration: (configuration: unknown) => void;
  updateThumbnail: (source: string) => void;
  computation: Computation;
  filters?: Filter[];
  starredVariables: VariableDescriptor[];
  toggleStarredVariable: (targetVariableId: VariableDescriptor) => void;
  totalCounts: PromiseHookState<EntityCounts>;
  filteredCounts: PromiseHookState<EntityCounts>;
  geoConfigs: GeoConfig[];
}

export type SelectorProps = VisualizationOverview;

export interface IsEnabledInPickerProps {
  // it's a function - do we still call its argument 'props'?
  geoConfigs?: GeoConfig[];
  studyMetadata?: StudyMetadata; // not used yet, but you could imagine it being used to determine
  // if a viz tool should be enabled
}

export interface VisualizationType {
  fullscreenComponent: React.ComponentType<VisualizationProps>;
  selectorComponent: React.ComponentType<SelectorProps>;
  createDefaultConfig: () => unknown;
  isEnabledInPicker?: (props: IsEnabledInPickerProps) => boolean;
}
