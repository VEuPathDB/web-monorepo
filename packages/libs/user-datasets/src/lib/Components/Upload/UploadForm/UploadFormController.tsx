import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useSetDocumentTitle } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { StrategySummary } from '@veupathdb/wdk-client/lib/Utils/WdkUser';
import { Loading } from '@veupathdb/wdk-client/lib/Components';

import { StateSlice } from '../../../StoreModules/types';

import {
  clearBadUpload,
  receiveBadUpload,
  requestUploadMessages,
  trackUploadProgress,
} from '../../../Actions/UserDatasetUploadActions';

import { Consumer } from '../../../Utils';
import { assertIsVdiCompatibleWdkService } from '../../../Service/utils/compatibility';
import { submitNewDataset } from '../../../Service/process/create-dataset';
import { DatasetPostResponseBody, VdiServiceMetadata } from '../../../Service';
import { BadUpload } from '../../../StoreModules';
import { DatasetUploadConfig } from '../Configuration';
import { UploadForm, UploadFormState } from './UploadForm';

export interface UploadFormControllerProps {
  readonly baseUrl: string;
  readonly formConfig: DatasetUploadConfig;
  readonly vdiConfig: VdiServiceMetadata;
  readonly urlParams: Record<string, string>;
  readonly uploadFormState: UploadFormState;
  readonly setUploadFormState: Consumer<UploadFormState>;
}

export function UploadFormController({
  baseUrl,
  formConfig,
  vdiConfig,
  urlParams,
  uploadFormState,
  setUploadFormState,
}: UploadFormControllerProps) {
  useSetDocumentTitle(formConfig.verbiage.formTitle);

  const strategyOptions = useWdkService(
    async (wdkService): Promise<StrategySummary[]> => {
      if (!formConfig.uploadConfig.result?.offerStrategyUpload) {
        return [];
      }

      const strategies = await wdkService.getStrategies();
      const compatibleRecordTypeNames = new Set(
        Object.keys(formConfig.uploadConfig.result.compatibleRecordTypes)
      );

      return strategies.filter(
        (strategy) =>
          strategy.recordClassName != null &&
          compatibleRecordTypeNames.has(strategy.recordClassName)
      );
    },
    [formConfig.uploadConfig.result?.offerStrategyUpload]
  );

  const [submitting, setSubmitting] = useState(false);

  const dispatch = useDispatch();

  const badUploadState = useSelector(
    (stateSlice: StateSlice) => stateSlice.userDatasetUpload.badUploadMessage
  );

  const clearBadUploadMessage = useCallback(() => {
    dispatch(clearBadUpload);
  }, [dispatch]);

  const uploadProgress = useSelector(
    (stateSlice: StateSlice) => stateSlice.userDatasetUpload.uploadProgress
  );

  const dispatchUploadProgress: Consumer<number | null> = useCallback(() => {
    dispatch(trackUploadProgress);
  }, [dispatch]);

  const submitForm = useCallback(
    ({ metadata, uploads }: UploadFormState) => {
      setSubmitting(true);
      dispatch(async ({ wdkService, transitioner }) => {
        try {
          assertIsVdiCompatibleWdkService(wdkService);

          await submitNewDataset({
            service: wdkService.vdi,
            details: metadata,
            uploads,
            onProgress: (progress: number | null) =>
              dispatch(trackUploadProgress(progress)),
            onSuccess: ({ datasetId }: DatasetPostResponseBody) => {
              setSubmitting(false);
              transitioner.transitionToInternalPage(`${baseUrl}/${datasetId}`);
            },
            onError: (error: BadUpload) => dispatch(receiveBadUpload(error)),
          });

          return requestUploadMessages();
        } catch (err) {
          return receiveBadUpload({
            timestamp: Date.now(),
            type: 500,
            message: String(err) ?? 'Failed to upload dataset',
          });
        }
      });
    },
    [dispatch, baseUrl]
  );

  useEffect(() => {
    if (badUploadState != null) {
      dispatchUploadProgress(null);
      setSubmitting(false);
    }
  }, [badUploadState, dispatchUploadProgress]);

  useEffect(() => {
    return () => {
      clearBadUpload();
    };
  }, []);

  return strategyOptions == null ? (
    <Loading />
  ) : (
    <div className="stack">
      <UploadForm
        baseUrl={baseUrl}
        vdiConfig={vdiConfig}
        badUploadState={badUploadState}
        isSubmitting={submitting}
        urlParams={urlParams}
        formState={uploadFormState}
        setFormState={setUploadFormState}
        actions={{
          submit: submitForm,
          clearUploadError: clearBadUpload,
        }}
        {...formConfig}
      />
    </div>
  );
}
