import React, { useMemo } from 'react';

import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { requestAddStepToBasket } from '@veupathdb/wdk-client/lib/Actions/BasketActions';
import { IconAlt } from '@veupathdb/wdk-client/lib/Components';
import { WdkService } from '@veupathdb/wdk-client/lib/Core';
import { Task } from '@veupathdb/wdk-client/lib/Utils/Task';
import { ResultType, StepResultType } from '@veupathdb/wdk-client/lib/Utils/WdkResult';
import { Step } from '@veupathdb/wdk-client/lib/Utils/WdkUser';

import {
  endpoint,
  rootUrl,
  useUserDatasetsWorkspace,
} from '@veupathdb/web-common/lib/config';
import { useNonNullableContext } from '@veupathdb/wdk-client/lib/Hooks/NonNullableContext';
import { WdkDependenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';

const SUPPORTED_RECORD_CLASS_URL_SEGMENTS = new Set([
  'transcript'
]);

function isGeneListStep(resultType: ResultType): resultType is StepResultType {
  return (
    resultType.type === 'step' &&
    SUPPORTED_RECORD_CLASS_URL_SEGMENTS.has(
      resultType.step.recordClassName
    )
  );
}

export function useGeneListExportOptions(
  resultType: ResultType
) {
  const onSelectBasketExportConfig = useSendToBasketConfig(resultType);
  const onSelectGeneListUserDatasetExportConfig = useSendToGeneListUserDatasetConfig(resultType);
  const onSelectPortalExportConfig = useSendGeneListToPortalStrategyConfig(resultType);

  return useMemo(
    () => [
      ...(
        onSelectBasketExportConfig
          ? [
              {
                label: (
                  <>
                    <IconAlt fa="shopping-basket fa-fw" />
                    {' '}
                    <span style={{ marginLeft: '0.5em' }}>
                      Basket
                    </span>
                  </>
                ),
                value: 'basket',
                ...onSelectBasketExportConfig,
              }
            ]
          : []
      ),
      ...(
        onSelectGeneListUserDatasetExportConfig
          ? [
              {
                label: (
                  <>
                    <IconAlt fa="files-o fa-fw" />
                    {' '}
                    <span style={{ marginLeft: '0.5em' }}>
                      My Data Sets
                    </span>
                  </>
                ),
                value: 'my-data-sets',
                ...onSelectGeneListUserDatasetExportConfig,
              }
            ]
          : []
      ),
      ...(
        onSelectPortalExportConfig
          ? [
              {
                label: (
                  <>
                    <IconAlt fa="code-fork fa-rotate-270 fa-fw" />
                    {' '}
                    <span style={{ marginLeft: '0.5em' }}>
                      VEuPathDB.org Strategy
                    </span>
                  </>
                ),
                value: 'portal-strategy',
                ...onSelectPortalExportConfig,
              }
            ]
          : []
      )
    ],
    [
      onSelectBasketExportConfig,
      onSelectGeneListUserDatasetExportConfig,
      onSelectPortalExportConfig
    ]
  );
}

export function useSendToBasketConfig(
  resultType: ResultType
) {
  const dispatch = useDispatch();

  return useMemo(
    () => isGeneListStep(resultType)
      ? ({
          onSelectionTask: Task.of(
            requestAddStepToBasket(
              resultType.step.id
            )
          ),
          onSelectionFulfillment: dispatch
        })
      : undefined,
    [resultType, dispatch]
  );
}

export function useSendToGeneListUserDatasetConfig(
  resultType: ResultType
) {
  const { wdkService } = useNonNullableContext(WdkDependenciesContext);

  const history = useHistory();

  return useMemo(
    () => isGeneListStep(resultType) && useUserDatasetsWorkspace
      ? ({
          onSelectionTask: Task.fromPromise(
            () => makeGeneListUserDatasetExportUrl(
              wdkService,
              resultType.step
            )
          ),
          onSelectionFulfillment: (geneListExportUrl: string) => {
            history.push(geneListExportUrl);
          },
        })
      : undefined,
    [resultType, wdkService, history]
  );
}

export function useSendGeneListToPortalStrategyConfig(
  resultType: ResultType,
  portalSiteRootUrl?: string
) {
  const { wdkService } = useNonNullableContext(WdkDependenciesContext);

  const projectId = useWdkService(
    async wdkService => (await wdkService.getConfig()).projectId
  );

  return useMemo(
    () => (
      isGeneListStep(resultType) &&
      projectId != null &&
      projectId !== 'EuPathDB'
    )
      ? ({
          onSelectionTask: Task.fromPromise(
            () => makeGeneListPortalSearchUrl(
              wdkService,
              resultType.step,
              portalSiteRootUrl
            )
          ),
          onSelectionFulfillment: (portalSearchUrl: string) => {
            window.open(portalSearchUrl, '_blank');
          },
        })
      : undefined,
    [
      resultType,
      portalSiteRootUrl,
      wdkService,
      projectId
    ]
  );
}

export async function makeGeneListUserDatasetExportUrl(
  wdkService: WdkService,
  step: Step
) {
  const temporaryResultUrl = await getGeneListTemporaryResultUrl(
    wdkService,
    step.id
  );

  const resultWorkspaceUrl =
   `${window.location.origin}${rootUrl}/workspace/strategies/${step.strategyId}/${step.id}`;

  const datasetDescription =
    `Uploaded a snapshot of ${
      step.estimatedSize == null ?
        'IDs' :
        `${step.estimatedSize} IDs`
    }` +
    ` on ${
      new Date().toUTCString()
    } from step "${step.customName}" (${resultWorkspaceUrl}).`;

  const urlParams = new URLSearchParams({
    datasetUrl: temporaryResultUrl,
    datasetName: step.customName,
    datasetSummary: `Genes from result "${step.customName}"`,
    datasetDescription,
  });

  return `/workspace/datasets/new?${urlParams.toString()}`;
}

export async function makeGeneListPortalSearchUrl(
  wdkService: WdkService,
  step: Step,
  portalSiteRootUrl: string = 'https://veupathdb.org/veupathdb/app',
) {
  const temporaryResultUrl = await getGeneListTemporaryResultUrl(
    wdkService,
    step.id
  );

  const searchUrl =
   `${portalSiteRootUrl}/search/transcript/GeneByLocusTag`;

  const urlParams = new URLSearchParams({
    'param.ds_gene_ids.url': temporaryResultUrl,
    autoRun: 'true',
  });

  return `${searchUrl}?${urlParams.toString()}`;
}

export async function getGeneListTemporaryResultUrl(
  wdkService: WdkService,
  stepId: number,
  fullWdkServiceUrl = `${window.location.origin}${endpoint}`
) {
  const temporaryResultPath = await wdkService.getTemporaryResultPath(
    stepId,
    'attributesTabular',
    {
      attributes: ['primary_key'],
      includeHeader: false,
      attachmentType: 'plain',
      applyFilter: true,
    }
  );

  return `${fullWdkServiceUrl}${temporaryResultPath}`;
}
