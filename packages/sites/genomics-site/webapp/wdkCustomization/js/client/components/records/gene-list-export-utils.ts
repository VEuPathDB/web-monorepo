import { useMemo } from 'react';

import { useDispatch } from 'react-redux';

import { requestAddStepToBasket } from '@veupathdb/wdk-client/lib/Actions/BasketActions';
import { WdkService } from '@veupathdb/wdk-client/lib/Core';
import { Task } from '@veupathdb/wdk-client/lib/Utils/Task';
import { ResultType } from '@veupathdb/wdk-client/lib/Utils/WdkResult';
import { Step } from '@veupathdb/wdk-client/lib/Utils/WdkUser';

import { endpoint, rootUrl } from '@veupathdb/web-common/lib/config';
import { useNonNullableContext } from '@veupathdb/wdk-client/lib/Hooks/NonNullableContext';
import { WdkDependenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
import { useHistory } from 'react-router-dom';

export function useSendToBasketConfig(
  resultType: ResultType
) {
  const dispatch = useDispatch();

  return useMemo(() => {
    if (resultType.type !== 'step') {
      return undefined;
    }

    return {
      onSelectionTask: Task.of(
        requestAddStepToBasket(
          resultType.step.id
        )
      ),
      onSelectionFulfillment: dispatch
    };
  }, [dispatch, resultType]);
}

export function useSendToGeneListUserDatasetConfig(
  resultType: ResultType
) {
  const { wdkService } = useNonNullableContext(WdkDependenciesContext);

  const history = useHistory();

  return useMemo(() => {
    if (resultType.type !== 'step') {
      return undefined;
    }

    return {
      onSelectionTask: Task.fromPromise(
        () => makeGeneListUserDatasetExportUrl(
          wdkService,
          resultType.step
        )
      ),
      onSelectionFulfillment: (geneListExportUrl: string) => {
        history.push(geneListExportUrl);
      },
    };
  }, [resultType, wdkService, history]);
}

export async function makeGeneListUserDatasetExportUrl(
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
