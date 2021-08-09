import { memoize } from 'lodash';
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
        reportConfig: { attributes, tables }
      })
    });

    if (useEda) {
      const studies = await getEdaStudies();
      const datasetIds = new Set(studies.map(study => study.datasetId));
      // TODO Mark non-eda studies as prerelease, instead of removing
      datasets.records = datasets.records.filter(record => datasetIds.has(record.attributes.dataset_id));
    }

    return datasets;
  },
  getSiteMessages: () => wdkService.sendRequest(ok, {
    useCache: false,
    method: 'get',
    path: '/site-messages'
  })
});

const getEdaStudies = memoize(async () => {
  const resp = await fetch('/eda-data/studies');
  const { studies } = await resp.json();
  return studies;
});
