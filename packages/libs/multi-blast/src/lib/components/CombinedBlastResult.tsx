import { useMemo, useState } from 'react';

import Mesa, { MesaState } from '@veupathdb/wdk-client/lib/Components/Mesa';
import { MesaSortObject } from '@veupathdb/wdk-client/lib/Core/CommonTypes';

import {
  useCombinedResultColumns,
  useMesaEventHandlers,
  useMesaUiState,
  useRawCombinedResultRows,
  useSortedCombinedResultRows,
} from '../hooks/combinedResults';
import { MultiQueryReportJson } from '../utils/ServiceTypes';

interface Props {
  combinedResult: MultiQueryReportJson;
  hitTypeDisplayName: string;
  wdkRecordType: string | null;
}

export function CombinedBlastResult({
  combinedResult,
  hitTypeDisplayName,
  wdkRecordType,
}: Props) {
  const columns = useCombinedResultColumns(hitTypeDisplayName, wdkRecordType);
  const rawRows = useRawCombinedResultRows(combinedResult, wdkRecordType);

  const [sort, setSort] = useState<MesaSortObject>({
    columnKey: 'rank',
    direction: 'asc',
  });

  const rows = useSortedCombinedResultRows(rawRows, sort);

  const eventHandlers = useMesaEventHandlers(setSort);

  const uiState = useMesaUiState(sort);

  const mesaState = useMemo(
    () => MesaState.create({ columns, eventHandlers, rows, uiState }),
    [columns, eventHandlers, uiState, rows]
  );

  return <Mesa state={mesaState} />;
}
