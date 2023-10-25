import { WdkService } from '@veupathdb/wdk-client/lib/Core';

import { FormSubmission } from '../Components/UploadForm';
import { assertIsVdiCompatibleWdkService } from '../Service/';

import { NewUserDataset } from './types';

export async function uploadUserDataset(
  wdkService: WdkService,
  formSubmission: FormSubmission
) {
  assertIsVdiCompatibleWdkService(wdkService);

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
  const { dataUploadSelection, ...remainingFormSubmission } = formSubmission;
  if (dataUploadSelection.type !== 'result') {
    return {
      ...remainingFormSubmission,
      uploadMethod: dataUploadSelection,
    };
  }

  const { compatibleRecordTypes, stepId } = dataUploadSelection;

  const { recordClassName } = await wdkService.findStep(stepId);

  const resultReportSettings = compatibleRecordTypes[recordClassName];

  if (resultReportSettings == null) {
    throw new Error(
      `Tried to upload a result (step id ${stepId}) with an incompatible record type ${recordClassName}.`
    );
  }

  return {
    ...remainingFormSubmission,
    uploadMethod: {
      type: 'result',
      stepId,
      ...resultReportSettings,
    },
  };
}
