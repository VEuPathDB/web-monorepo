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
import { JobStatus } from '../computations/ComputeJobStatusHook';

/**
 * Props passed to viz components
 */
export interface VisualizationProps<Options = undefined> {
  options?: Options;
  visualization: Visualization;
  dataElementConstraints?: Record<string, DataElementConstraint>[];
  dataElementDependencyOrder?: string[][];
  updateConfiguration: (configuration: unknown) => void;
  updateThumbnail?: (source: string) => void;
  computation: Computation;
  filters?: Filter[];
  starredVariables: VariableDescriptor[];
  toggleStarredVariable: (targetVariableId: VariableDescriptor) => void;
  totalCounts: PromiseHookState<EntityCounts>;
  filteredCounts: PromiseHookState<EntityCounts>;
  geoConfigs: GeoConfig[];
  otherVizOverviews: VisualizationOverview[];
  computeJobStatus?: JobStatus;
  hideInputsAndControls?: boolean;
  plotContainerStyles?: React.CSSProperties;
}

export interface IsEnabledInPickerParams {
  geoConfigs?: GeoConfig[];
  studyMetadata?: StudyMetadata; // not used yet, but you could imagine it being used to determine
  // if a viz tool should be enabled
}

export interface ComputedVariableDetails {
  entityId: string;
  placeholderDisplayName: string;
  variableId?: string;
}
