import { AnalysisState } from '../../hooks/analysis';
import { EntityCounts } from '../../hooks/entityCounts';
import { PromiseHookState } from '../../hooks/promise';
import { Computation, ComputationAppOverview } from '../../types/visualization';

export interface ComputationProps {
  analysisState: AnalysisState;
  computationAppOverview: ComputationAppOverview;
  totalCounts: PromiseHookState<EntityCounts>;
  filteredCounts: PromiseHookState<EntityCounts>;
}

export interface ComputationOverviewProps extends ComputationProps {}

export interface ComputationInstanceProps extends ComputationProps {
  computation: Computation;
}

export interface ComputationComponents {
  /** Screen that shows details of app and existing instances */
  overview: React.ComponentType<ComputationOverviewProps>;
  /** Screen that allows user to configure an app instance */
  create: React.ComponentType<ComputationOverviewProps>;
  /** Screen that allow user to update configuration of an app instance */
  edit: React.ComponentType<ComputationInstanceProps>;
  /** Screen that allows user to add visuzliations to an app instance */
  instance: React.ComponentType<ComputationInstanceProps>;
}

export interface ComputationPlugin {
  configurationComponent: React.ComponentType<ComputationOverviewProps>;
}
