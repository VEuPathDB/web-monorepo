import { Filter } from '../types/filter';
import { VariableSpec } from './VariableCoverageTable';
import { useEntityCounts } from '../hooks/entityCounts';
import { CoverageStatistics } from '../types/visualization';

interface Props extends Partial<CoverageStatistics> {
  isStratificationActive: boolean;
  filters: Filter[];
  variableSpecs: VariableSpec[];
  outputEntityId?: string;
}

export function BirdsEyeView(props: Props) {
  const {
    isStratificationActive,
    filters,
    variableSpecs,
    outputEntityId,
    plottedCompleteCases,
    plottedIncompleteCases,
    completeCases,
  } = props;

  const unfilteredEntityCounts = useEntityCounts();
  const filteredEntityCounts = useEntityCounts(filters);

  const totalSize =
    unfilteredEntityCounts.value && outputEntityId
      ? unfilteredEntityCounts.value[outputEntityId]
      : undefined;
  const subsetSize =
    filteredEntityCounts.value && outputEntityId
      ? filteredEntityCounts.value[outputEntityId]
      : undefined;
  return (
    <div className="BirdsEyeView">
      stratification is {isStratificationActive ? 'active' : 'inactive'} <br />
      total size {totalSize ?? 'NA'} <br />
      subset size {subsetSize ?? 'NA'} <br />
      plotted complete {plottedCompleteCases ?? 'NA'} <br />
      plotted incomplete {plottedIncompleteCases ?? 'NA'} <br />
    </div>
  );
}
