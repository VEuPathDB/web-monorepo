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
