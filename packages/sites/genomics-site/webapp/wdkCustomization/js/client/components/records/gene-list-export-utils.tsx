import React, { useMemo } from 'react';

import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { Tooltip } from '@veupathdb/components/lib/components/widgets/Tooltip';

import { uploadUserDataset } from '@veupathdb/user-datasets/lib/Utils/upload-user-dataset';

import { requestAddStepToBasket } from '@veupathdb/wdk-client/lib/Actions/BasketActions';
import { IconAlt, Link } from '@veupathdb/wdk-client/lib/Components';
import { WdkService } from '@veupathdb/wdk-client/lib/Core';
import { useNonNullableContext } from '@veupathdb/wdk-client/lib/Hooks/NonNullableContext';
import { WdkDependenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { Task } from '@veupathdb/wdk-client/lib/Utils/Task';
import { RecordClass } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { ResultType, StepResultType } from '@veupathdb/wdk-client/lib/Utils/WdkResult';
import { Step } from '@veupathdb/wdk-client/lib/Utils/WdkUser';
import { enqueueStrategyNotificationAction } from '@veupathdb/wdk-client/lib/Views/Strategy/StrategyNotifications';

import {
  endpoint,
  rootUrl,
  useUserDatasetsWorkspace,
} from '@veupathdb/web-common/lib/config';
import { useProjectUrls } from '@veupathdb/web-common/lib/hooks/projectUrls';

import { ExportOption } from './ResultExportSelector';

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
      onSelectBasketExportConfig,
      onSelectGeneListUserDatasetExportConfig,
      onSelectPortalExportConfig
    ].filter(
      exportConfig => exportConfig != null
    ),
    [
      onSelectBasketExportConfig,
      onSelectGeneListUserDatasetExportConfig,
      onSelectPortalExportConfig
    ]
  );
}

export function useSendToBasketConfig(
  resultType: ResultType
): ExportOption<'basket', ReturnType<typeof requestAddStepToBasket>, unknown> | undefined {
  const dispatch = useDispatch();

  const isGuest = useWdkService(
    async wdkService => (await wdkService.getCurrentUser()).isGuest,
    []
  );

  return useMemo(
    () => isGeneListStep(resultType)
      ? ({
          value: 'basket',
          label: (
            <Tooltip
              css={{}}
              title={isGuest !== false
                ? 'You must be logged in to use this feature'
                : ''
              }
            >
              <div>
                <IconAlt fa="shopping-basket fa-fw" />
                {' '}
                <span style={{ marginLeft: '0.5em' }}>
                  Basket
                </span>
              </div>
            </Tooltip>
          ),
          isDisabled: isGuest !== false,
          onSelectionTask: Task.of(
            requestAddStepToBasket(
              resultType.step.id
            )
          ),
          onSelectionFulfillment: dispatch
        })
      : undefined,
    [resultType, dispatch, isGuest]
  );
}

export function useSendToGeneListUserDatasetConfig(
  resultType: ResultType
): ExportOption<"my-data-sets", [void, RecordClass], unknown> | undefined {
  const dispatch = useDispatch();

  const { wdkService } = useNonNullableContext(WdkDependenciesContext);

  const projectDisplayName = useWdkService(
    async wdkService => (await wdkService.getConfig()).displayName,
    []
  );

  const history = useHistory();

  const isGuest = useWdkService(
    async wdkService => (await wdkService.getCurrentUser()).isGuest,
    []
  );

  return useMemo(
    () => isGeneListStep(resultType) && useUserDatasetsWorkspace
      ? ({
          value: 'my-data-sets',
          label: (
            <Tooltip
              css={{}}
              title={
                isGuest !== false
                  ? 'You must be logged in to use this feature'
                  : ''
              }
            >
              <div>
                <IconAlt fa="files-o fa-fw" />
                {' '}
                <span style={{ marginLeft: '0.5em' }}>
                  My Data Sets
                </span>
              </div>
            </Tooltip>
          ),
          isDisabled: isGuest !== false,
          onSelectionTask: Task.fromPromise(
            () => Promise.all([
              uploadGeneListUserDataset(
                wdkService,
                resultType.step
              ),
              wdkService.findRecordClass(resultType.step.recordClassName)
            ])
          ),
          onSelectionFulfillment: ([, recordClass]) => {
            dispatch(
              enqueueStrategyNotificationAction(
                <div>
                  A data set with the {
                    resultType.step.estimatedSize === 1
                      ? recordClass.displayName
                      : recordClass.displayNamePlural
                  } in step "{resultType.step.customName}" was uploaded to{' '}
                  <Link to="/workspace/datasets">
                    My Data Sets
                  </Link>.
                  <br />
                  It will be ready for use once we have finished installing it in {projectDisplayName}.
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
                  An error occurred while trying to upload the contents of step "{
                    resultType.step.customName
                  }" to{' '}
                  <Link to="/workspace/datasets">
                    My Data Sets
                  </Link>.
                  <br />
                  Please try again, and{' '}
                  <Link target="_blank" to="/contact-us">contact us</Link>{' '}
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
          }
        })
      : undefined,
    [
      resultType,
      wdkService,
      history,
      dispatch,
      projectDisplayName,
      isGuest
    ]
  );
}

export function useSendGeneListToPortalStrategyConfig(
  resultType: ResultType
): ExportOption<"portal-strategy", string, unknown> | undefined {
  const dispatch = useDispatch();

  const { wdkService } = useNonNullableContext(WdkDependenciesContext);

  const projectId = useWdkService(
    async wdkService => (await wdkService.getConfig()).projectId,
    []
  );

  const projectUrls = useProjectUrls();

  return useMemo(
    () => (
      isGeneListStep(resultType) &&
      projectId != null &&
      projectId !== 'EuPathDB' &&
      projectUrls != null &&
      projectUrls.EuPathDB != null
    )
      ? ({
          value: 'portal-strategy',
          label: (
            <>
              <IconAlt fa="code-fork fa-rotate-270 fa-fw" />
              {' '}
              <span style={{ marginLeft: '0.5em' }}>
                VEuPathDB.org Strategy
              </span>
            </>
          ),
          onSelectionTask: Task.fromPromise(
            () => makeGeneListPortalSearchUrl(
              wdkService,
              resultType.step,
              new URL(
                'app',
                projectUrls.EuPathDB
              ).toString()
            )
          ),
          onSelectionFulfillment: (portalSearchUrl: string) => {
            window.open(portalSearchUrl, '_blank');
          },
          onSelectionError: (error) => {
            dispatch(
              enqueueStrategyNotificationAction(
                <div>
                  An error occurred while trying to export the contents of step "{
                    resultType.step.customName
                  }" to <a href={projectUrls.EuPathDB} target="_blank">
                    VEuPathDB
                  </a>.
                  <br />
                  Please try again, and{' '}
                  <Link to="/contact-us" target="_blank" >contact us</Link>{' '}
                  if the problem persists.
                </div>,
                {
                  key: `portal-upload-${Date.now()}`,
                  variant: 'error',
                  persist: true,
                }
              )
            );

            throw error;
          }
        })
      : undefined,
    [
      dispatch,
      resultType,
      projectId,
      wdkService,
      projectUrls
    ]
  );
}

export async function uploadGeneListUserDataset(
  wdkService: WdkService,
  step: Step
) {
  const [temporaryResultUrl, { projectId }] = await Promise.all([
    getGeneListTemporaryResultUrl(
      wdkService,
      step.id
    ),
    wdkService.getConfig()
  ]);

  const resultWorkspaceUrl =
   `${window.location.origin}${rootUrl}/workspace/strategies/${step.strategyId}/${step.id}`;

  const idDisplayName = step.estimatedSize == null
    ? 'IDs'
    : step.estimatedSize === 1
    ? '1 ID'
    : `${step.estimatedSize} IDs`;

  const datasetDescription =
    `Uploaded a snapshot of ${
      idDisplayName
    }` +
    ` on ${
      new Date().toUTCString()
    } from step "${step.customName}" (${resultWorkspaceUrl}).`;

  return await uploadUserDataset(
    wdkService,
    {
      datasetType: 'gene-list',
      dataUploadSelection: {
        type: 'url',
        url: temporaryResultUrl
      },
      projects: [
        projectId
      ],
      name: step.customName,
      summary: `Genes from step "${step.customName}"`,
      description: datasetDescription,
    }
  );
}

export async function makeGeneListPortalSearchUrl(
  wdkService: WdkService,
  step: Step,
  portalSiteRootUrl: string
) {
  const [
    temporaryResultUrl,
    { displayName: projectDisplayName },
    { displayNamePlural: recordClassDisplayName }
  ] = await Promise.all([
    getGeneListTemporaryResultUrl(
      wdkService,
      step.id
    ),
    wdkService.getConfig(),
    wdkService.findRecordClass(step.recordClassName)
  ]);

  const searchUrl =
   `${portalSiteRootUrl}/search/transcript/GeneByLocusTag`;

  const urlParams = new URLSearchParams({
    'param.ds_gene_ids.url': temporaryResultUrl,
    autoRun: 'true',
    strategyName: `${recordClassDisplayName} from ${
      projectDisplayName
    } step "${
      step.customName
    }"`
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
