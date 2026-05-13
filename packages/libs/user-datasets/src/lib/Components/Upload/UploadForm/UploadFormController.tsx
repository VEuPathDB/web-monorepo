import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useSetDocumentTitle } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

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
import { UploadForm } from './UploadForm';
import { useUploadFormState } from '../../../StoreModules/UserDatasetUploadStoreModule';

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

  const formState = useUploadFormState();

  const dispatchUploadProgress: Consumer<number | null> = useCallback(() => {
    dispatch(trackUploadProgress);
  }, [dispatch]);

  const submitForm = useCallback(() => {
    const { datasetDetails, fileUploads } = formState;

    setSubmitting(true);
    dispatch(async ({ wdkService, transitioner }) => {
      try {
        assertIsVdiCompatibleWdkService(wdkService);

        await submitNewDataset({
          service: wdkService.vdi,
          details: {
            type: {
              name: formConfig.dataType.name,
              version: formConfig.dataType.version,
            },
            ...datasetDetails,
          },
          uploads: fileUploads,
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
  }, [formState, dispatch, formConfig.dataType, baseUrl]);

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

  return (
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
