import { WdkService } from '@veupathdb/wdk-client/lib/Core';

import { FormSubmission } from '../Components/UploadForm';
import { assertIsUserDatasetUploadCompatibleWdkService } from '../Service/UserDatasetUploadWrappers';

import { NewUserDataset } from './types';

export async function uploadUserDataset(
  wdkService: WdkService,
  formSubmission: FormSubmission
) {
  assertIsUserDatasetUploadCompatibleWdkService(wdkService);

  const newUserDatasetConfig = await makeNewUserDatasetConfig(
    wdkService,
    formSubmission
  );

  return await wdkService.addDataset(newUserDatasetConfig);
}

export async function makeNewUserDatasetConfig(
  wdkService: WdkService,
  formSubmission: FormSubmission
): Promise<NewUserDataset> {
  if (formSubmission.dataUploadSelection.type !== 'result') {
    return {
      ...formSubmission,
      uploadMethod: formSubmission.dataUploadSelection,
    };
  }

  const { compatibleRecordTypes, stepId } = formSubmission.dataUploadSelection;

  const { recordClassName } = await wdkService.findStep(stepId);

  const resultReportSettings = compatibleRecordTypes[recordClassName];

  if (resultReportSettings == null) {
    throw new Error(
      `Tried to upload a result (step id ${stepId}) with an incompatible record type ${recordClassName}.`
    );
  }

  return {
    ...formSubmission,
    uploadMethod: {
      type: 'result',
      stepId,
      ...resultReportSettings,
    },
  };
}
