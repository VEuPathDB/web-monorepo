import storeModules from 'wdk-client/StoreModules';

import * as record from 'ortho-client/store-modules/RecordStoreModule';

// FIXME: Refine these types once EbrcWebsiteCommon's Redux has
// been converted to TypeScript
type EbrcStoreModules = typeof storeModules;
type OrthoMclStoreModules = EbrcStoreModules;

export function wrapStoreModules(ebrcStoreModules: EbrcStoreModules): OrthoMclStoreModules {
  return {
    ...ebrcStoreModules,
    record
  };
}
