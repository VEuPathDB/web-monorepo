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
import { submitNewDataset } from '../../Service/process/create-dataset';
import { createValidationError } from '../../Service/Model/constructors';
import { useSetDocumentTitle } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

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

  return <DatasetFormController
    {...props}
    form={UploadForm}
    propFactory={p => {
      return {
        ...p,
        actions: {
          ...p.actions,
          submit: () => submitAction(
            dispatch,
            formState,
            p.formConfig,
            p.actions.setSubmitting,
            p.baseUrl
          )
        }
      };
    }}
  />;
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
        receiveBadUpload([{
          type: 422,
          errors: createValidationError(validationErrors),
        }])
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
          dispatch(updateFormState(DefaultDatasetFormState));
          transitioner.transitionToInternalPage(`${baseUrl}/${datasetId}`);
        },
        onError: (error: BadUpload) => dispatch(receiveBadUpload([error])),
      });

      return requestUploadMessages();
    } catch (err) {
      return receiveBadUpload([{
        type: 500,
        message: String(err) ?? 'Failed to upload dataset',
      }]);
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

  return filtered;
}
