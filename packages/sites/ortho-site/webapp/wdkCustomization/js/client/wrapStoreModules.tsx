import storeModules from 'wdk-client/StoreModules';

// FIXME: Refine these types once EbrcWebsiteCommon's Redux has
// been converted to TypeScript
type EbrcStoreModules = typeof storeModules;
type OrthoMclStoreModules = EbrcStoreModules;

export function wrapStoreModules(ebrcStoreModules: EbrcStoreModules): OrthoMclStoreModules {
  return ebrcStoreModules;
}
