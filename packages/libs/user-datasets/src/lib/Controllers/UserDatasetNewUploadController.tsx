import { useCallback } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { Link, useRouteMatch } from 'react-router-dom';

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
import { NotFoundController } from '@veupathdb/wdk-client/lib/Controllers';
import { UploadFormMenu } from '../Components/UploadFormMenu';

const SUPPORTED_FILE_UPLOAD_TYPES: string[] = [];

interface Props {
  baseUrl: string;
  type?: string;
  availableTypes: string[];
  datasetUploadTypes: Record<string, DatasetUploadTypeConfigEntry<string>>;
  urlParams: Record<string, string>;
}

export default function UserDatasetUploadSelector(props: Props) {
  const { baseUrl, type, availableTypes, datasetUploadTypes, urlParams } =
    props;
  const { url } = useRouteMatch();

  if (type == null && availableTypes.length !== 1) {
    return (
      <UploadFormMenu
        availableTypes={availableTypes}
        datasetUploadTypes={datasetUploadTypes}
      />
    );
  }

  const datasetUploadType = datasetUploadTypes[type ?? availableTypes[0]];
  if (datasetUploadType == null) {
    return <NotFoundController />;
  }

  return (
    <>
      <Link to={url.replace(/\/[^/]+$/, '')}>
        Back to choose an upload type
      </Link>
      <InnerUserDatasetUploadController
        baseUrl={baseUrl}
        datasetUploadType={datasetUploadType}
        urlParams={urlParams}
      />
    </>
  );
}

interface InnerProps<T extends string = string> {
  baseUrl: string;
  datasetUploadType: DatasetUploadTypeConfigEntry<T>;
  urlParams: Record<string, string>;
}

function InnerUserDatasetUploadController({
  baseUrl,
  datasetUploadType,
  urlParams,
}: InnerProps) {
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
              transitioner.transitionToInternalPage(`${baseUrl}/${datasetId}`),
            // callback to handle bad uploads
            (error: string) => dispatch(receiveBadUpload(error))
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
        key={'upload-form-' + datasetUploadType.type}
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
        maxSizeBytes={
          datasetUploadType.formConfig.uploadMethodConfig.file?.maxSizeBytes
        }
      />
    </div>
  );
}
