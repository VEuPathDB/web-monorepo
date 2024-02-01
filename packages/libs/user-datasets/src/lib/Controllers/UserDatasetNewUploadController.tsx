import { useCallback } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { useSetDocumentTitle } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { StrategySummary } from '@veupathdb/wdk-client/lib/Utils/WdkUser';

import {
  clearBadUpload,
  submitUploadForm,
  trackUploadProgress,
} from '../Actions/UserDatasetUploadActions';

import UploadForm, { FormSubmission } from '../Components/UploadForm';

import { StateSlice } from '../StoreModules/types';

import {
  DatasetUploadTypeConfigEntry,
  NewUserDatasetMeta,
} from '../Utils/types';

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

  // const submitForm = useCallback(
  //   (formSubmission: FormSubmission, redirectTo?: string) => {
  //     dispatch(submitUploadForm(formSubmission, redirectTo));
  //   },
  //   [dispatch]
  // );

  const submitForm = useCallback(
    (formSubmission: FormSubmission, redirectTo?: string) => {
      const { dataUploadSelection, ...remainingFormSubmission } =
        formSubmission;
      const newUserDatasetConfig = Object.assign({}, remainingFormSubmission, {
        uploadMethod: dataUploadSelection,
      });
      const { uploadMethod, ...remainingConfig } = newUserDatasetConfig;
      const meta: NewUserDatasetMeta = {
        ...remainingConfig,
        datasetType: {
          name: newUserDatasetConfig.datasetType,
          version: '1.0',
        },
        dependencies: [],
        origin: 'direct-upload',
      };

      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener('progress', (e) => {
        const progress = Math.floor((e.loaded / e.total) * 100);
        dispatch(trackUploadProgress(progress));
      });
      xhr.upload.addEventListener('load', () => {
        xhr.addEventListener('readystatechange', () => {
          if (xhr.readyState === XMLHttpRequest.DONE) {
            try {
              const response = JSON.parse(xhr.response);
              dispatch(submitUploadForm(response.datasetId, redirectTo));
              dispatch(trackUploadProgress(null));
            } catch (error) {
              console.error(error);
            }
          }
        });
      });

      const fileBody = new FormData();
      fileBody.append('meta', JSON.stringify(meta));

      if (uploadMethod.type === 'file') {
        fileBody.append('file', uploadMethod.file);
      } else if (uploadMethod.type === 'url') {
        console.log('url');
        fileBody.append('url', uploadMethod.url);
      } else {
        throw new Error(
          `Tried to upload a dataset via an unrecognized upload method '${uploadMethod.type}'`
        );
      }

      const wdkCheckAuthEntry = document.cookie
        .split('; ')
        .find((x) => x.startsWith('wdk_check_auth='));

      if (wdkCheckAuthEntry == null) {
        throw new Error(
          `Tried to retrieve a non-existent WDK auth key for user`
        );
      }
      const authKey = wdkCheckAuthEntry.replace(/^wdk_check_auth=/, '');

      xhr.open('POST', '/vdi-service/vdi-datasets', true);
      xhr.setRequestHeader('Auth-Key', authKey);
      xhr.send(fileBody);
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
