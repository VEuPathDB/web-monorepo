import {
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
import { Consumer, DataNoun } from '../../Utils';
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
import { cleanDatasetDetails } from '../../Service/Datasets/payload-cleanup';
import { newDatasetUploads } from '../../Service/Model';
import { validateFormState } from '../../Service/Datasets/upload-validation';

export interface UploadFormControllerProps {
  readonly baseUrl: string;
  readonly formConfig: DatasetFormConfig;
  readonly vdiConfig: VdiServiceMetadata;
  readonly urlParams: Record<string, string>;
  readonly dataNoun: DataNoun;
  readonly enablePublicDatasets: boolean;
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

      let finalFileUploads = formState;

      if (formConfig.prepareDataFiles != null) {
        try {
          finalFileUploads = {
            ...finalFileUploads,
            dataFileSelections: formConfig.prepareDataFiles(formState.dataFileSelections),
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
          ...cleanDatasetDetails(formState.datasetDetails),
        },
        uploads: newDatasetUploads(finalFileUploads),
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
