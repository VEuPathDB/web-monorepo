import { AnalysisState } from '../../hooks/analysis';
import { EntityCounts } from '../../hooks/entityCounts';
import { PromiseHookState } from '../../hooks/promise';
import { ComputationAppOverview } from '../../types/visualization';

export interface ComputationProps {
  analysisState: AnalysisState;
  computationAppOverview: ComputationAppOverview;
  totalCounts: PromiseHookState<EntityCounts>;
  filteredCounts: PromiseHookState<EntityCounts>;
}
