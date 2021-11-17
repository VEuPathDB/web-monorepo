import { EntityCounts } from '../../hooks/entityCounts';
import { Filter } from '../../types/filter';
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
  totalCounts: EntityCounts | undefined;
  filteredCounts: EntityCounts | undefined;
}

export type SelectorProps = VisualizationOverview;

export interface VisualizationType {
  fullscreenComponent: React.ComponentType<VisualizationProps>;
  selectorComponent: React.ComponentType<SelectorProps>;
  createDefaultConfig: () => unknown;
}
