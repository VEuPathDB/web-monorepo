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
import {
  utf8ByteLength,
  SAMPLE_INFO_MAX_BYTES,
  findDuplicateFileName,
  findManifestNameCollision,
  hasAllowedExtension,
  hasTabInName,
} from '../../Service/utils/rnaseq-rc-data-files';

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
                p.vdiConfig,
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
  vdiConfig: VdiServiceMetadata,
  setSubmitting: Consumer<boolean>,
  baseUrl: string
) {
  const { fileUploads } = formState;

  // Clear out previous error attempt messages.
  dispatch(clearBadUpload());

  {
    const validationErrors = validateFormState(
      formState,
      formConfig,
      vdiConfig
    );

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

      let finalFileUploads = fileUploads;

      if (formConfig.prepareDataFiles != null) {
        try {
          finalFileUploads = {
            ...fileUploads,
            dataFiles: formConfig.prepareDataFiles(
              fileUploads.dataFiles ?? [],
              formState.datasetDetails
            ),
          };
        } catch (e) {
          setSubmitting(false);
          return receiveBadUpload([
            {
              type: 400,
              message:
                e instanceof Error
                  ? e.message
                  : 'Failed to prepare upload files',
            },
          ]);
        }
      }

      await submitNewDataset({
        service: wdkService.vdi,
        details: {
          type: {
            name: formConfig.dataType.name,
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
  { datasetDetails, fileUploads }: DatasetFormState,
  formConfig: DatasetFormConfig,
  vdiConfig: VdiServiceMetadata
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

  const { samplesDescription } = datasetDetails;

  if (
    samplesDescription != null &&
    utf8ByteLength(samplesDescription) > SAMPLE_INFO_MAX_BYTES
  ) {
    keyedErrors['$.details.samplesDescription'] = [
      `too long: ${utf8ByteLength(
        samplesDescription
      ).toLocaleString()} bytes, maximum ${SAMPLE_INFO_MAX_BYTES.toLocaleString()}`,
    ];
  }

  const dataFiles = fileUploads.dataFiles ?? [];

  const duplicate = findDuplicateFileName(dataFiles);
  if (duplicate != null) {
    keyedErrors['$.dataFiles'] = [
      `two data files are both named "${duplicate}" - please rename one`,
    ];
  }

  const tabbed = hasTabInName(dataFiles);
  if (tabbed != null) {
    keyedErrors['$.dataFiles'] = [
      `the file name "${tabbed}" contains a tab character - please rename it`,
    ];
  }

  // Only forms that generate a manifest (currently rnaseqrc, via
  // `prepareDataFiles`) reserve this name - other dataset types have no
  // reason to reject a file merely named "manifest.tsv".
  if (formConfig.prepareDataFiles != null) {
    const manifestCollision = findManifestNameCollision(dataFiles);
    if (manifestCollision != null) {
      keyedErrors['$.dataFiles'] = [
        `"${manifestCollision}" is a reserved name (used internally for the manifest) - please rename your file`,
      ];
    }
  }

  // The `accept` attribute is advisory - some file pickers let users override
  // it - so re-check here rather than relying on the builder's throw. This
  // still surfaces as an unlinked entry in the top-of-form error banner
  // (UploadErrorBanner), not inline against the field, since no element has
  // id "$.dataFiles".
  const allowed = formConfig.dataType.vdiConfig.allowedFileExtensions;
  const archiveTypes = vdiConfig.features.supportedArchiveTypes;
  const badExtension =
    // An empty list means the backend "can't validate" and accepts anything;
    // mirror that rather than rejecting every file (as an empty list would
    // if compared with `.some`).
    allowed.length === 0
      ? undefined
      : dataFiles.find(
          (f) =>
            !hasAllowedExtension(f.name, archiveTypes) &&
            !hasAllowedExtension(f.name, allowed)
        );
  if (badExtension != null) {
    keyedErrors['$.dataFiles'] = [
      `"${
        badExtension.name
      }" is not an accepted file type - permitted types are ${allowed.join(
        ', '
      )}`,
    ];
  }

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
