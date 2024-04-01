import React, { useEffect, useMemo } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { Tooltip } from '@veupathdb/coreui';

import { uploadUserDataset } from '@veupathdb/user-datasets/lib/Utils/upload-user-dataset';

import {
  requestAddStepToBasket,
  requestBasketCounts,
} from '@veupathdb/wdk-client/lib/Actions/BasketActions';
import { IconAlt, Link } from '@veupathdb/wdk-client/lib/Components';
import { WdkService } from '@veupathdb/wdk-client/lib/Core';
import { useNonNullableContext } from '@veupathdb/wdk-client/lib/Hooks/NonNullableContext';
import { WdkDependenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { Task } from '@veupathdb/wdk-client/lib/Utils/Task';
import { RecordClass } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import {
  ResultType,
  StepResultType,
} from '@veupathdb/wdk-client/lib/Utils/WdkResult';
import { Step } from '@veupathdb/wdk-client/lib/Utils/WdkUser';
import { enqueueStrategyNotificationAction } from '@veupathdb/wdk-client/lib/Views/Strategy/StrategyNotifications';

import {
  endpoint,
  rootUrl,
  useUserDatasetsWorkspace,
} from '@veupathdb/web-common/lib/config';
import { useProjectUrls } from '@veupathdb/web-common/lib/hooks/projectUrls';

import { ExportOption } from './ResultExportSelector';
import { RootState } from '@veupathdb/wdk-client/lib/Core/State/Types';

const GENOMICS_PROJECTS_LIST = [
  'VEuPathDB',
  'AmoebaDB',
  'CryptoDB',
  'FungiDB',
  'GiardiaDB',
  'MicrosporidiaDB',
  'PiroplasmaDB',
  'PlasmoDB',
  'ToxoDB',
  'TrichDB',
  'TriTrypDB',
  'VectorBase',
];

const SUPPORTED_RECORD_CLASS_URL_SEGMENTS = new Set(['transcript']);

function isGeneListStep(resultType: ResultType): resultType is StepResultType {
  return (
    resultType.type === 'step' &&
    SUPPORTED_RECORD_CLASS_URL_SEGMENTS.has(resultType.step.recordClassName)
  );
}

export function useGeneListExportOptions(resultType: ResultType) {
  const onSelectBasketAddExportConfig = useSendToBasketConfig(
    resultType,
    false
  );
  const onSelectBasketReplaceExportConfig = useSendToBasketConfig(
    resultType,
    true
  );
  const onSelectGeneListUserDatasetExportConfig =
    useSendToGeneListUserDatasetConfig(resultType);
  const onSelectGenomicSiteExportConfigs =
    useSendGeneListToGenomicSiteStrategyConfig(resultType);
  return useMemo(
    () =>
      [
        onSelectBasketAddExportConfig,
        onSelectBasketReplaceExportConfig,
        onSelectGeneListUserDatasetExportConfig,
        ...(onSelectGenomicSiteExportConfigs
          ? onSelectGenomicSiteExportConfigs
          : []),
      ].filter((exportConfig) => exportConfig != null),
    [
      onSelectBasketAddExportConfig,
      onSelectBasketReplaceExportConfig,
      onSelectGeneListUserDatasetExportConfig,
      onSelectGenomicSiteExportConfigs,
    ]
  );
}

export function useSendToBasketConfig(
  resultType: ResultType,
  clearFirst: boolean
):
  | ExportOption<'basket', ReturnType<typeof requestAddStepToBasket>, unknown>
  | undefined {
  const dispatch = useDispatch();

  const basketCount = useSelector((state: RootState) => {
    if (resultType.type === 'step') {
      return state.basket.counts?.[resultType.step.recordClassName] ?? 0;
    }
    return 0;
  });

  const isGuest = useWdkService(
    async (wdkService) => (await wdkService.getCurrentUser()).isGuest,
    []
  );

  useEffect(() => {
    if (!clearFirst && !(isGuest ?? true)) {
      dispatch(requestBasketCounts());
    }
  }, [clearFirst, dispatch, isGuest]);

  return useMemo(
    () =>
      isGeneListStep(resultType)
        ? {
            value: 'basket',
            label: (
              <Tooltip
                title={
                  isGuest !== false
                    ? 'You must be logged in to use this feature'
                    : ''
                }
              >
                <div>
                  <IconAlt fa="shopping-basket fa-fw" />{' '}
                  <span style={{ marginLeft: '0.5em' }}>
                    Basket (
                    {clearFirst
                      ? 'replace'
                      : 'add to ' + basketCount.toLocaleString() + ' genes'}
                    )
                  </span>
                </div>
              </Tooltip>
            ),
            isDisabled: isGuest !== false,
            onSelectionTask: Task.of(
              requestAddStepToBasket(resultType.step.id, clearFirst)
            ),
            onSelectionFulfillment: dispatch,
          }
        : undefined,
    [resultType, clearFirst, dispatch, isGuest, basketCount]
  );
}

export function useSendToGeneListUserDatasetConfig(
  resultType: ResultType
): ExportOption<'my-data-sets', [void, RecordClass], unknown> | undefined {
  const dispatch = useDispatch();

  const { wdkService } = useNonNullableContext(WdkDependenciesContext);

  const projectDisplayName = useWdkService(
    async (wdkService) => (await wdkService.getConfig()).displayName,
    []
  );

  const isGuest = useWdkService(
    async (wdkService) => (await wdkService.getCurrentUser()).isGuest,
    []
  );

  return useMemo(
    () =>
      isGeneListStep(resultType) && useUserDatasetsWorkspace
        ? {
            value: 'my-data-sets',
            label: (
              <Tooltip
                title={
                  isGuest !== false
                    ? 'You must be logged in to use this feature'
                    : ''
                }
              >
                <div>
                  <IconAlt fa="files-o fa-fw" />{' '}
                  <span style={{ marginLeft: '0.5em' }}>My Data Sets</span>
                </div>
              </Tooltip>
            ),
            isDisabled: isGuest !== false,
            onSelectionTask: Task.fromPromise(() =>
              Promise.all([
                uploadGeneListUserDataset(wdkService, resultType.step),
                wdkService.findRecordClass(resultType.step.recordClassName),
              ])
            ),
            onSelectionFulfillment: ([, recordClass]) => {
              dispatch(
                enqueueStrategyNotificationAction(
                  <div>
                    A data set with the{' '}
                    {resultType.step.estimatedSize === 1
                      ? recordClass.displayName
                      : recordClass.displayNamePlural}{' '}
                    in step "{resultType.step.customName}" was uploaded to{' '}
                    <Link to="/workspace/datasets">My Data Sets</Link>.
                    <br />
                    It will be ready for use once we have finished installing it
                    in {projectDisplayName}.
                  </div>,
                  {
                    key: `gene-list-upload-${Date.now()}`,
                    variant: 'success',
                    persist: true,
                  }
                )
              );
            },
            onSelectionError: (error) => {
              dispatch(
                enqueueStrategyNotificationAction(
                  <div>
                    An error occurred while trying to upload the contents of
                    step "{resultType.step.customName}" to{' '}
                    <Link to="/workspace/datasets">My Data Sets</Link>.
                    <br />
                    Please try again, and{' '}
                    <Link target="_blank" to="/contact-us">
                      contact us
                    </Link>{' '}
                    if the problem persists.
                  </div>,
                  {
                    key: `gene-list-upload-${Date.now()}`,
                    variant: 'error',
                    persist: true,
                  }
                )
              );

              throw error;
            },
          }
        : undefined,
    [resultType, wdkService, dispatch, projectDisplayName, isGuest]
  );
}

export function useSendGeneListToGenomicSiteStrategyConfig(
  resultType: ResultType
): ExportOption<string, string, unknown>[] | undefined {
  const dispatch = useDispatch();

  const { wdkService } = useNonNullableContext(WdkDependenciesContext);

  const projectId = useWdkService(
    async (wdkService) => (await wdkService.getConfig()).projectId,
    []
  );

  const exportableProjectIds = GENOMICS_PROJECTS_LIST.filter(
    (id) =>
      (projectId !== 'EuPathDB' && id === 'VEuPathDB') ||
      (projectId === 'EuPathDB' && id !== 'VEuPathDB')
  );

  const projectUrls = useProjectUrls();

  return useMemo(
    () =>
      isGeneListStep(resultType) && projectId != null && projectUrls != null
        ? exportableProjectIds.map((id) => ({
            value: `${id}-strategy`,
            label: (
              <>
                <IconAlt fa="code-fork fa-rotate-270 fa-fw" />{' '}
                <span style={{ marginLeft: '0.5em' }}>{id}.org Strategy</span>
              </>
            ),
            onSelectionTask: Task.fromPromise(() =>
              makeGeneListGenomicsSearchUrl(
                wdkService,
                resultType.step,
                new URL(
                  'app',
                  id === 'VEuPathDB' ? projectUrls.EuPathDB : projectUrls[id]
                ).toString()
              )
            ),
            onSelectionFulfillment: (genomicsSiteSearchUrl: string) => {
              window.open(genomicsSiteSearchUrl, '_blank');
            },
            onSelectionError: (error) => {
              dispatch(
                enqueueStrategyNotificationAction(
                  <div>
                    An error occurred while trying to export the contents of
                    step "{resultType.step.customName}" to{' '}
                    <a
                      href={
                        id === 'VEuPathDB'
                          ? projectUrls.EuPathDB
                          : `https://${id}.org/${id}`
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      {id}
                    </a>
                    .
                    <br />
                    Please try again, and{' '}
                    <Link to="/contact-us" target="_blank">
                      contact us
                    </Link>{' '}
                    if the problem persists.
                  </div>,
                  {
                    key: `genomics-upload-${Date.now()}`,
                    variant: 'error',
                    persist: true,
                  }
                )
              );

              throw error;
            },
          }))
        : undefined,
    [
      dispatch,
      resultType,
      projectId,
      wdkService,
      projectUrls,
      exportableProjectIds,
    ]
  );
}

export async function uploadGeneListUserDataset(
  wdkService: WdkService,
  step: Step
) {
  const [temporaryResultUrl, { projectId }] = await Promise.all([
    getGeneListTemporaryResultUrl(wdkService, step.id),
    wdkService.getConfig(),
  ]);

  const resultWorkspaceUrl = `${window.location.origin}${rootUrl}/workspace/strategies/${step.strategyId}/${step.id}`;

  const idDisplayName =
    step.estimatedSize == null
      ? 'IDs'
      : step.estimatedSize === 1
      ? '1 ID'
      : `${step.estimatedSize} IDs`;

  const datasetDescription =
    `Uploaded a snapshot of ${idDisplayName}` +
    ` on ${new Date().toUTCString()} from step "${
      step.customName
    }" (${resultWorkspaceUrl}).`;

  return await uploadUserDataset(wdkService, {
    datasetType: 'gene-list',
    dataUploadSelection: {
      type: 'url',
      url: temporaryResultUrl,
    },
    projects: [projectId],
    name: step.customName,
    summary: `Genes from step "${step.customName}"`,
    description: datasetDescription,
  });
}

export async function makeGeneListGenomicsSearchUrl(
  wdkService: WdkService,
  step: Step,
  siteRootUrl: string
) {
  const [
    temporaryResultUrl,
    { displayName: projectDisplayName },
    { displayNamePlural: recordClassDisplayName },
  ] = await Promise.all([
    getGeneListTemporaryResultUrl(wdkService, step.id),
    wdkService.getConfig(),
    wdkService.findRecordClass(step.recordClassName),
  ]);

  const searchUrl = `${siteRootUrl}/search/transcript/GeneByLocusTag`;

  const urlParams = new URLSearchParams({
    'param.ds_gene_ids.url': temporaryResultUrl,
    autoRun: 'true',
    strategyName: `${recordClassDisplayName} from ${projectDisplayName} step "${step.customName}"`,
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
