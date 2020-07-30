import { keyBy, mapValues, once } from 'lodash';

import { ProteinType } from '../utils/clusterGraph';
import { GenomeSourcesRows } from '../utils/dataSummary';

import { useOrthoService } from './orthoService';

export function useGenomeSourcesRows() {
  return useOrthoService(
    orthoService => orthoService.getGenomeSources(),
    []
  );
}

export function useGenomeStatisticsRows() {
  return useOrthoService(
    orthoService => orthoService.getGenomeStatistics(),
    []
  );
}

function makeCorePeripheralMap(genomeSourcesRows: GenomeSourcesRows): Record<string, ProteinType> {
  const speciesByAbbrev = keyBy(genomeSourcesRows, 'three_letter_abbrev');

  return mapValues(
    speciesByAbbrev,
    genomeSourcesRow => genomeSourcesRow.core_peripheral
  );
}

const memoizedCorePeripheralMapMaker = once(makeCorePeripheralMap);

export function useCorePeripheralMap() {
  const genomeSourcesRows = useGenomeSourcesRows();

  return genomeSourcesRows == null
    ? undefined
    : memoizedCorePeripheralMapMaker(genomeSourcesRows);
}
