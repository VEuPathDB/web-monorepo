import { ok } from '@veupathdb/wdk-client/lib/Utils/Json';

export default (wdkService) => ({
  ...wdkService,
  getStudies(attributes, tables = []) {
    return wdkService.sendRequest(ok, {
      useCache: true,
      cacheId: 'studies',
      method: 'post',
      path: wdkService.getStandardSearchReportEndpoint(
        'dataset',
        'AllDatasets'
      ),
      body: JSON.stringify({
        searchConfig: { parameters: {} },
        reportConfig: {
          attributes,
          tables,
          sorting: [
            { attributeName: 'is_prerelease', direction: 'ASC' },
            { attributeName: 'primary_key', direction: 'ASC' },
          ],
        },
      }),
    });
  },
  getSiteMessages: () =>
    wdkService.sendRequest(ok, {
      useCache: false,
      method: 'get',
      path: '/site-messages',
    }),
});
