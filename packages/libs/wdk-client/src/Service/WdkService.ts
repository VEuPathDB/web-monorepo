import { memoize } from 'lodash';
import { composeMixins, CompositeService as WdkService } from 'wdk-client/Service/ServiceMixins';

export default WdkService;

// Memoize based on serviceUrl, so that we only create one instance per
// serviceUrl. This will ensure that multiple caches are not created.
export const getInstance = memoize(composeMixins);
