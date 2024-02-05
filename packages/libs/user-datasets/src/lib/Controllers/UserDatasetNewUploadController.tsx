import { useCallback } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { useSetDocumentTitle } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { StrategySummary } from '@veupathdb/wdk-client/lib/Utils/WdkUser';

import {
  clearBadUpload,
  receiveBadUpload,
  requestUploadMessages,
  trackUploadProgress,
} from '../Actions/UserDatasetUploadActions';

import UploadForm, { FormSubmission } from '../Components/UploadForm';

import { StateSlice } from '../StoreModules/types';

import { datasetIdType, DatasetUploadTypeConfigEntry } from '../Utils/types';
import { assertIsVdiCompatibleWdkService } from '../Service';

const SUPPORTED_FILE_UPLOAD_TYPES = ['csv', 'gz', 'tgz', 'tsv', 'txt', 'zip'];

interface Props<T extends string = string> {
  baseUrl: string;
  datasetUploadType: DatasetUploadTypeConfigEntry<T>;
  urlParams: Record<string, string>;
}

export default function UserDatasetUploadController({
  baseUrl,
  datasetUploadType,
  urlParams,
}: Props) {
  useSetDocumentTitle(datasetUploadType.uploadTitle);

  const projectId = useWdkService(
    (wdkService) => wdkService.getConfig().then((config) => config.projectId),
    []
  );

  const strategyOptions = useWdkService(
    async (wdkService): Promise<StrategySummary[]> => {
      if (
        !datasetUploadType.formConfig.uploadMethodConfig.result
          ?.offerStrategyUpload
      ) {
        return [];
      }

      const strategies = await wdkService.getStrategies();
      const compatibleRecordTypeNames = new Set(
        Object.keys(
          datasetUploadType.formConfig.uploadMethodConfig.result
            .compatibleRecordTypes
        )
      );

      return strategies.filter(
        (strategy) =>
          strategy.recordClassName != null &&
          compatibleRecordTypeNames.has(strategy.recordClassName)
      );
    },
    [
      datasetUploadType.formConfig.uploadMethodConfig.result
        ?.offerStrategyUpload,
    ]
  );

  const badUploadMessage = useSelector(
    (stateSlice: StateSlice) => stateSlice.userDatasetUpload.badUploadMessage
  );

  const uploadProgress = useSelector(
    (stateSlice: StateSlice) => stateSlice.userDatasetUpload.uploadProgress
  );

  const dispatch = useDispatch();

  const clearBadUploadMessage = useCallback(() => {
    dispatch(clearBadUpload);
  }, [dispatch]);

  const dispatchUploadProgress = useCallback(() => {
    dispatch(trackUploadProgress);
  }, [dispatch]);

  const submitForm = useCallback(
    (formSubmission: FormSubmission, baseUrl?: string) => {
      dispatch(async ({ wdkService, transitioner }) => {
        try {
          assertIsVdiCompatibleWdkService(wdkService);
          wdkService.addUserDataset(
            formSubmission,
            // callback to handle progress events
            (progress: number | null) =>
              dispatch(trackUploadProgress(progress)),
            // callback to redirect to new dataset page
            (datasetId: typeof datasetIdType) =>
              baseUrl &&
              transitioner.transitionToInternalPage(`${baseUrl}/${datasetId}`)
          );
          return requestUploadMessages();
        } catch (err) {
          return receiveBadUpload(String(err) ?? 'Failed to upload dataset');
        }
      });
    },
    [dispatch]
  );

  return projectId == null ||
    SUPPORTED_FILE_UPLOAD_TYPES == null ||
    strategyOptions == null ? (
    <Loading />
  ) : (
    <div className="stack">
      <UploadForm
        baseUrl={baseUrl}
        datasetUploadType={datasetUploadType}
        projectId={projectId}
        badUploadMessage={badUploadMessage}
        clearBadUpload={clearBadUploadMessage}
        submitForm={submitForm}
        dispatchUploadProgress={dispatchUploadProgress}
        uploadProgress={uploadProgress?.progress}
        urlParams={urlParams}
        strategyOptions={strategyOptions}
        resultUploadConfig={
          datasetUploadType.formConfig.uploadMethodConfig.result
        }
        supportedFileUploadTypes={SUPPORTED_FILE_UPLOAD_TYPES}
      />
    </div>
  );
}
