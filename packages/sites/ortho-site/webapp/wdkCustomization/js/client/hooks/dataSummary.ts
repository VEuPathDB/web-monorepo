import { keyBy, mapValues, once } from 'lodash';

import { ProteinType } from 'ortho-client/utils/clusterGraph';
import { ProteomeSummaryRows } from 'ortho-client/utils/dataSummary';

import { useOrthoService } from 'ortho-client/hooks/orthoService';

export function useProteomeSummaryRows() {
  return useOrthoService(
    orthoService => orthoService.getProteomeSummary(),
    []
  );
}

function makeCorePeripheralMap(proteomeSummaryRows: ProteomeSummaryRows): Record<string, ProteinType> {
  const speciesByAbbrev = keyBy(proteomeSummaryRows, 'three_letter_abbrev');

  return mapValues(
    speciesByAbbrev,
    proteomeSummaryRow => proteomeSummaryRow.core_peripheral
  );
}

const memoizedCorePeripheralMapMaker = once(makeCorePeripheralMap);

export function useCorePeripheralMap() {
  const proteomeSummaryRows = useProteomeSummaryRows();

  return proteomeSummaryRows == null
    ? undefined
    : memoizedCorePeripheralMapMaker(proteomeSummaryRows);
}
