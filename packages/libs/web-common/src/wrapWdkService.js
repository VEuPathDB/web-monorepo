import { ok } from 'wdk-client/Utils/Json';

export default wdkService => ({
  ...wdkService,
  getStudies: (attributes, tables = []) => wdkService.sendRequest(ok, {
    useCache: true,
    cacheId: 'studies',
    method: 'post',
    path: wdkService.getStandardSearchReportEndpoint('dataset', 'AllDatasets'),
    body: JSON.stringify({
      searchConfig: { parameters: {} },
      reportConfig: { attributes, tables }
    })
  }),
  getSiteMessages: () => wdkService.sendRequest(ok, {
    useCache: false,
    method: 'get',
    path: '/site-messages'
  })
});
