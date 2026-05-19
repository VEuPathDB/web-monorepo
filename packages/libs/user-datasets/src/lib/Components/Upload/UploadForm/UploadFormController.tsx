import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useSetDocumentTitle } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

import { StateSlice } from '../../../StoreModules/types';

import {
  clearBadUpload,
  receiveBadUpload,
  requestUploadMessages,
  trackUploadProgress,
  updateFormState,
} from '../../../Actions/UserDatasetUploadActions';

import { assertIsVdiCompatibleWdkService } from '../../../Service/utils/compatibility';
import { submitNewDataset } from '../../../Service/process/create-dataset';
import {
  DatasetPostDetails,
  DatasetPostResponseBody,
  VdiServiceMetadata,
} from '../../../Service';
import { BadUpload, UploadFormState } from '../../../StoreModules';
import { DatasetUploadConfig } from '../Configuration';
import { UploadForm } from './UploadForm';
import {
  defaultUploadFormState,
  useUploadFormState,
} from '../../../StoreModules/UserDatasetUploadStoreModule';
import {
  DatasetSourcesToggleID,
  DatasetUsageToggleID,
  FieldStudyToggleID,
} from './Sections/Core';
import { isEmpty } from 'lodash';
import { createValidationError } from '../../../Service/Model/constructors';

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

  const formState = useUploadFormState();

  const submitForm = useCallback(() => {
    const { fileUploads } = formState;

    // Clear out previous error attempt messages.
    dispatch(clearBadUpload());

    {
      const validationErrors = validateFormState(formState);

      if (!isEmpty(validationErrors)) {
        dispatch(
          receiveBadUpload({
            type: 422,
            errors: createValidationError(validationErrors),
          })
        );

        return;
      }
    }

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
            ...filterDetails(formState),
          },
          uploads: fileUploads,
          onProgress: (progress: number | null) =>
            dispatch(trackUploadProgress(progress)),
          onSuccess: ({ datasetId }: DatasetPostResponseBody) => {
            setSubmitting(false);
            dispatch(updateFormState(defaultUploadFormState()));
            transitioner.transitionToInternalPage(`${baseUrl}/${datasetId}`);
          },
          onError: (error: BadUpload) => dispatch(receiveBadUpload(error)),
        });

        return requestUploadMessages();
      } catch (err) {
        return receiveBadUpload({
          type: 500,
          message: String(err) ?? 'Failed to upload dataset',
        });
      }
    });
  }, [formState, dispatch, formConfig.dataType, baseUrl]);

  useEffect(() => {
    if (badUploadState != null) {
      dispatch(trackUploadProgress(null));
      setSubmitting(false);
    }
  }, [badUploadState, dispatch]);

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

/**
 * Validate the upload form state, performing basic checks that the user has
 * performed all required client-side-only form steps before attempting an
 * upload.
 */
function validateFormState({
  formMetaState: clientSide,
}: UploadFormState): Record<string, string[]> {
  const keyedErrors: Record<string, string[]> = {};
  const errorMessage = ['selection is required'];

  // Required Client-Only Fields
  if (clientSide.isStudy === undefined)
    keyedErrors[FieldStudyToggleID] = errorMessage;
  if (clientSide.hasDisclaimer === undefined)
    keyedErrors[DatasetUsageToggleID] = errorMessage;
  if (clientSide.hasExternalSources === undefined)
    keyedErrors[DatasetSourcesToggleID] = errorMessage;

  return keyedErrors;
}

function filterDetails({
  formMetaState,
  datasetDetails,
}: UploadFormState): DatasetPostDetails {
  const filtered = { ...datasetDetails };

  if (!formMetaState.isStudy) delete filtered['datasetCharacteristics'];
  if (!formMetaState.hasDisclaimer) delete filtered['dataDisclaimer'];
  if (!formMetaState.hasExternalSources) delete filtered['datasetSources'];

  return filtered;
}
