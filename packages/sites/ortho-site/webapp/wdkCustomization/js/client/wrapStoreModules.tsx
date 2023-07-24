import storeModules from '@veupathdb/wdk-client/lib/StoreModules';

import * as blastSummaryView from '@veupathdb/blast-summary-view/lib/StoreModules/BlastSummaryViewStoreModule';

import * as orthoRecord from 'ortho-client/store-modules/RecordStoreModule';

// FIXME: Refine these types once EbrcWebsiteCommon's Redux has
// been converted to TypeScript
type EbrcStoreModules = typeof storeModules;
interface OrthoMclStoreModules extends EbrcStoreModules {
  [blastSummaryView.key]: typeof blastSummaryView;
}

export function wrapStoreModules(
  ebrcStoreModules: EbrcStoreModules
): OrthoMclStoreModules {
  return {
    ...ebrcStoreModules,
    record: {
      ...ebrcStoreModules.record,
      ...orthoRecord,
    },
    blastSummaryView,
  };
}
