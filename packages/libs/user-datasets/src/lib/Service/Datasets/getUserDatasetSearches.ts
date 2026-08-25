import * as Decode from '@veupathdb/wdk-client/lib/Utils/Json';
import { questionDecoder } from '@veupathdb/wdk-client/lib/Service/Decoders/RecordClassDecoders';
import { Question } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { ServiceBase } from '@veupathdb/wdk-client/lib/Service/ServiceBase';

const recordTypeSearchesDecoder = Decode.arrayOf(
  Decode.field('searches', Decode.arrayOf(questionDecoder))
);

/**
 * Fetches the searches available for a user dataset type, deliberately
 * bypassing the record-types cache.
 *
 * `globalData.questions` is loaded once at page load and derived from
 * `getRecordClasses()`, which is memoized *and* backed by a persistent
 * URL-keyed store. A dataset installed during this session therefore has no
 * searches in it, and no dataset-detail refresh can add them. Passing
 * `useCache: false` sends the request straight through `_fetchJson`
 * (see ServiceBase.ts), skipping both layers.
 *
 * Do not "simplify" this to `wdkService.getRecordClasses()` — that is the
 * memoized path this exists to avoid.
 */
export async function getUserDatasetSearches(
  wdkService: ServiceBase,
  userDatasetType: string
): Promise<Question[]> {
  const recordTypes = await wdkService.sendRequest(recordTypeSearchesDecoder, {
    method: 'get',
    path: '/record-types',
    params: { format: 'expanded' },
    useCache: false,
  });

  return recordTypes
    .flatMap((rt) => rt.searches)
    .filter(
      (q) =>
        q.properties != null &&
        'userDatasetType' in q.properties &&
        q.properties.userDatasetType.includes(userDatasetType)
    );
}
