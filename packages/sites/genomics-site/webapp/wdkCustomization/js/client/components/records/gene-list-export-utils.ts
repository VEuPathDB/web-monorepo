import { WdkService } from '@veupathdb/wdk-client/lib/Core';
import { Step } from '@veupathdb/wdk-client/lib/Utils/WdkUser';

import { endpoint, rootUrl } from '@veupathdb/web-common/lib/config';

export async function makeGeneListExportUrl(
  wdkService: WdkService,
  step: Step
) {
  const temporaryResultPath = await wdkService.getTemporaryResultPath(
    step.id,
    'attributesTabular',
    {
      attributes: ['primary_key'],
      includeHeader: false,
      attachmentType: 'plain',
      applyFilter: true,
    }
  );

  const temporaryResultUrl =
    `${window.location.origin}${endpoint}${temporaryResultPath}`;

  const resultWorkspaceUrl =
   `${window.location.origin}${rootUrl}/workspace/strategies/${step.strategyId}/${step.id}`;

  const urlParams = new URLSearchParams({
    useFixedUploadMethod: 'true',
    datasetUrl: temporaryResultUrl,
    datasetSource: `Result "${step.customName}"`,
    datasetName: step.customName,
    datasetSummary: `Genes from result "${step.customName}"`,
    datasetDescription: `Uploaded from ${resultWorkspaceUrl}`
  });

  return `/workspace/datasets/new?${urlParams.toString()}`;
}
