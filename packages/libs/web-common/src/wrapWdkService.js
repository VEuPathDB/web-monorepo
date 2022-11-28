import { useEda } from 'ebrc-client/config';
import { ok } from '@veupathdb/wdk-client/lib/Utils/Json';

export default wdkService => ({
  ...wdkService,
  async getStudies(attributes, tables = []) {
    const datasets = await wdkService.sendRequest(ok, {
      useCache: true,
      cacheId: 'studies',
      method: 'post',
      path: wdkService.getStandardSearchReportEndpoint('dataset', 'AllDatasets'),
      body: JSON.stringify({
        searchConfig: { parameters: {} },
        reportConfig: {
          attributes, tables, sorting: [
            { attributeName: 'is_prerelease', direction: 'ASC' },
            { attributeName: 'primary_key', direction: 'ASC' },
          ]
        }
      })
    });

    if (useEda) {
      // TODO Mark non-eda studies as prerelease, instead of removing
      datasets.records = datasets.records.filter(record => record.attributes.eda_study_id != null);
    }

    return datasets;
  },
  getSiteMessages: () => wdkService.sendRequest(ok, {
    useCache: false,
    method: 'get',
    path: '/site-messages'
  })
});
