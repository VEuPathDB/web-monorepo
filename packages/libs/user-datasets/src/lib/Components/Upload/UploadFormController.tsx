import {
  PartialDatasetDetails,
  DatasetPostResponseBody,
  VdiServiceMetadata,
} from '../../Service';
import { DatasetFormConfig } from '../../Common/Configuration';
import { UploadForm } from './UploadForm';
import { DatasetFormController } from '../../Common/Forms/DatasetFormController';
import { useDispatch } from 'react-redux';
import {
  BadUpload,
  DatasetFormState,
  DefaultDatasetFormState,
  useDatasetFormState,
} from '../../StoreModules/UserDatasetUploadStoreModule';
import { Dispatch } from 'redux';
import { EpicDependencies } from '@veupathdb/wdk-client/lib/Core/Store';
import { Consumer } from '../../Utils';
import {
  clearBadUpload,
  receiveBadUpload,
  requestUploadMessages,
  trackUploadProgress,
  updateFormState,
} from '../../Actions/UserDatasetUploadActions';
import { isEmpty } from 'lodash';
import { assertIsVdiCompatibleWdkService } from '../../Service/utils/compatibility';
import { submitNewDataset } from '../../Service/Datasets';
import { createValidationError } from '../../Service/Model/constructors';
import { useSetDocumentTitle } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { transformRnaSeqRcUpload } from '../../Service/utils/rnaseq-rc-file-transformer';

export interface UploadFormControllerProps {
  readonly baseUrl: string;
  readonly formConfig: DatasetFormConfig;
  readonly vdiConfig: VdiServiceMetadata;
  readonly urlParams: Record<string, string>;
}

export function UploadFormController(props: UploadFormControllerProps) {
  useSetDocumentTitle(props.formConfig.verbiage.formTitle);

  const dispatch = useDispatch();
  const formState = useDatasetFormState();

  return (
    <DatasetFormController
      {...props}
      form={UploadForm}
      propFactory={(p) => {
        return {
          ...p,
          actions: {
            ...p.actions,
            submit: () =>
              submitAction(
                dispatch,
                formState,
                p.formConfig,
                p.actions.setSubmitting,
                p.baseUrl
              ),
          },
        };
      }}
    />
  );
}

function submitAction(
  dispatch: Dispatch<any, EpicDependencies>,
  formState: DatasetFormState,
  formConfig: DatasetFormConfig,
  setSubmitting: Consumer<boolean>,
  baseUrl: string
) {
  const { fileUploads } = formState;

  // Clear out previous error attempt messages.
  dispatch(clearBadUpload());

  {
    const validationErrors = validateFormState(formState, formConfig);

    if (!isEmpty(validationErrors)) {
      dispatch(
        receiveBadUpload([
          {
            type: 422,
            errors: createValidationError(validationErrors),
          },
        ])
      );

      return;
    }
  }

  setSubmitting(true);
  dispatch(async ({ wdkService, transitioner }) => {
    try {
      assertIsVdiCompatibleWdkService(wdkService);

      // Transform files for rnaseq-rc:1.0
      // (identified by presence of samplesDescription field in form config)
      let finalFileUploads = fileUploads;

      if (
        formConfig.verbiage.formInputs?.samplesDescription &&
        fileUploads.dataFiles &&
        fileUploads.dataFiles.length > 0
      ) {
        try {
          const transformedFile = await transformRnaSeqRcUpload(
            fileUploads.dataFiles[0],
            formState.datasetDetails.samplesDescription,
            fileUploads.antisenseDataFiles?.[0]
          );

          // Create a new FileList-like array with the transformed file
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(transformedFile);

          finalFileUploads = {
            ...fileUploads,
            dataFiles: dataTransfer.files,
            antisenseDataFiles: undefined, // Clear antisense since it's now in the zip
          };
        } catch (transformError) {
          setSubmitting(false);
          return receiveBadUpload([
            {
              type: 400,
              message:
                transformError instanceof Error
                  ? transformError.message
                  : 'Failed to transform upload files',
            },
          ]);
        }
      }

      // PROTOTYPE: Map rnaseq-rc to rnaseq for backend submission
      const backendTypeName =
        formConfig.dataType.name === 'rnaseq-rc'
          ? 'rnaseq'
          : formConfig.dataType.name;

      await submitNewDataset({
        service: wdkService.vdi,
        details: {
          type: {
            name: backendTypeName,
            version: formConfig.dataType.version,
          },
          ...filterDetails(formState),
        },
        uploads: finalFileUploads,
        onProgress: (progress: number | null) =>
          dispatch(trackUploadProgress(progress)),
        onSuccess: ({ datasetId }: DatasetPostResponseBody) => {
          setSubmitting(false);
          dispatch(updateFormState(DefaultDatasetFormState));
          transitioner.transitionToInternalPage(`${baseUrl}/${datasetId}`);
        },
        onError: (error: BadUpload) => dispatch(receiveBadUpload([error])),
      });

      return requestUploadMessages();
    } catch (err) {
      return receiveBadUpload([
        {
          type: 500,
          message: String(err) ?? 'Failed to upload dataset',
        },
      ]);
    }
  });
}

/**
 * Validate the upload form state, performing basic checks that the user has
 * performed all required client-side-only form steps before attempting an
 * upload.
 */
function validateFormState(
  { datasetDetails }: DatasetFormState,
  formConfig: DatasetFormConfig
): Record<string, string[]> {
  const keyedErrors: Record<string, string[]> = {};

  if (
    formConfig.dependencies?.required === true &&
    isEmpty(datasetDetails.dependencies)
  ) {
    keyedErrors['$.details.dependencies'] = ['selection is required'];
  }

  /* TODO: to be re-enabled for the update form
  const errorMessage = ['selection is required'];

  // Required Client-Only Fields
  if (clientSide.isStudy === undefined)
    keyedErrors[FieldStudyToggleID] = errorMessage;
  if (clientSide.hasDisclaimer === undefined)
    keyedErrors[DatasetUsageToggleID] = errorMessage;
  if (clientSide.hasExternalSources === undefined)
    keyedErrors[DatasetSourcesToggleID] = errorMessage;
   */

  return keyedErrors;
}

function filterDetails({
  formMetaState,
  datasetDetails,
}: DatasetFormState): PartialDatasetDetails {
  const filtered = { ...datasetDetails };

  if (!formMetaState.isStudy) delete filtered['datasetCharacteristics'];
  if (!formMetaState.hasDisclaimer) delete filtered['dataDisclaimer'];
  if (!formMetaState.hasExternalSources) delete filtered['datasetSources'];
  if (!formMetaState.hasPublications) delete filtered['publications'];
  if (!formMetaState.hasExperimentalOrganism)
    delete filtered['experimentalOrganism'];

  return filtered;
}
