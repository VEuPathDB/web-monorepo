import { useMemo, useState } from 'react';

import Mesa, { MesaState } from '@veupathdb/wdk-client/lib/Components/Mesa';
import { MesaSortObject } from '@veupathdb/wdk-client/lib/Core/CommonTypes';

import {
  useCombinedResultColumns,
  useHitCounts,
  useMesaEventHandlers,
  useMesaUiState,
  useRawCombinedResultRows,
  useSortedCombinedResultRows,
} from '../hooks/combinedResults';
import { MultiQueryReportJson } from '../utils/ServiceTypes';

import './CombinedResult.scss';

interface Props {
  combinedResult: MultiQueryReportJson;
  filesToOrganisms: Record<string, string>;
  hitTypeDisplayName: string;
  hitTypeDisplayNamePlural: string;
  wdkRecordType: string | null;
}

export function CombinedBlastResult({
  combinedResult,
  filesToOrganisms,
  hitTypeDisplayName,
  hitTypeDisplayNamePlural,
  wdkRecordType,
}: Props) {
  const { hitQueryCount, hitSubjectCount, totalQueryCount } = useHitCounts(
    combinedResult
  );

  const columns = useCombinedResultColumns(hitTypeDisplayName, wdkRecordType);
  const rawRows = useRawCombinedResultRows(
    combinedResult,
    wdkRecordType,
    filesToOrganisms
  );

  const [sort, setSort] = useState<MesaSortObject>({
    columnKey: 'queryRank',
    direction: 'asc',
  });

  const rows = useSortedCombinedResultRows(rawRows, sort);

  const eventHandlers = useMesaEventHandlers(setSort);

  const uiState = useMesaUiState(sort);

  const mesaState = useMemo(
    () => MesaState.create({ columns, eventHandlers, rows, uiState }),
    [columns, eventHandlers, uiState, rows]
  );

  return (
    <div className="CombinedResult">
      <div className="ResultSummary">
        {hitQueryCount} of your {totalQueryCount} query sequences hit{' '}
        {hitSubjectCount} {hitTypeDisplayNamePlural.toLowerCase()}
      </div>
      <Mesa state={mesaState} />
    </div>
  );
}
