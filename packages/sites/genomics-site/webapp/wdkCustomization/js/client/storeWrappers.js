import ApiGalaxyTermsStore from './stores/GalaxyTermsStore';
import ApiRecordViewStore from './stores/RecordViewStore';

/** Provide GalaxyTermsStore */
export function GalaxyTermsStore() {
  return ApiGalaxyTermsStore;
}

/** Return a subclass of the provided RecordViewStore */
export function RecordViewStore() {
  return ApiRecordViewStore;
}
