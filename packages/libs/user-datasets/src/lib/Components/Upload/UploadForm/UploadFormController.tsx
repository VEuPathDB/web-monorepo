import { useSetDocumentTitle } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { StrategySummary } from '@veupathdb/wdk-client/lib/Utils/WdkUser';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StateSlice } from '../../../StoreModules/types';
import {
  clearBadUpload,
  receiveBadUpload,
  requestUploadMessages,
  trackUploadProgress,
} from '../../../Actions/UserDatasetUploadActions';
import { Consumer } from '../../../Utils';
import { DatasetPostDetails } from "../../../Service";
import { DatasetUploads } from '../../../Service/model/utility-types';
import { assertIsVdiCompatibleWdkService } from '../../../Service/utils/compatibility';
import { submitNewDataset } from '../../../Service/process/create-dataset';
import {
  DatasetPostResponseBody,
  VdiServiceMetadata,
} from '../../../Service/model/response-decoders';
import { BadUpload } from '../../../StoreModules/UserDatasetUploadStoreModule';
import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { DatasetUploadConfig } from "../Configuration";
import { UploadForm } from "./UploadForm";

export interface UploadFormControllerProps {
  readonly baseUrl: string;
  readonly formConfig: DatasetUploadConfig;
  readonly vdiConfig: VdiServiceMetadata;
  readonly urlParams: Record<string, string>;
}

export function UploadFormController({
  baseUrl,
  formConfig,
  vdiConfig,
  urlParams,
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
    (details: DatasetPostDetails, uploads: DatasetUploads) => {
      setSubmitting(true);
      dispatch(async ({ wdkService, transitioner }) => {
        try {
          assertIsVdiCompatibleWdkService(wdkService);

          await submitNewDataset({
            service: wdkService.vdi,
            details,
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
        actions={{
          submit: submitForm,
          clearUploadError: clearBadUpload,
        }}
        {...formConfig}
      />
    </div>
  );
}
