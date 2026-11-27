import Banner from '@veupathdb/coreui/lib/components/banners/Banner';
import { AnalysisState } from '../../core/hooks/analysis';

const SUBSET_NOTE =
  'Counts here are for the whole dataset. Your analysis subset is not applied.';

/** Warns that the analysis subset does not apply; nothing without a subset. */
export function SubsetNote({
  analysisState,
}: {
  analysisState: AnalysisState;
}) {
  const hasSubset =
    (analysisState.analysis?.descriptor.subset.descriptor.length ?? 0) > 0;
  return hasSubset ? (
    <Banner banner={{ type: 'warning', message: SUBSET_NOTE }} />
  ) : null;
}
