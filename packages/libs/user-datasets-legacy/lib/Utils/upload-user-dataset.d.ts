import { WdkService } from '@veupathdb/wdk-client/lib/Core';
import { FormSubmission } from '../Components/UploadForm';
import { NewUserDataset } from './types';
export declare function uploadUserDataset(
  wdkService: WdkService,
  formSubmission: FormSubmission
): Promise<void>;
export declare function makeNewUserDatasetConfig(
  wdkService: WdkService,
  formSubmission: FormSubmission
): Promise<NewUserDataset>;
//# sourceMappingURL=upload-user-dataset.d.ts.map
