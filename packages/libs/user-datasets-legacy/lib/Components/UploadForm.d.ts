/// <reference types="react" />
import { StrategySummary } from '@veupathdb/wdk-client/lib/Utils/WdkUser';
import { State } from '../StoreModules/UserDatasetUploadStoreModule';
import {
  CompatibleRecordTypes,
  DatasetUploadTypeConfigEntry,
  NewUserDataset,
  ResultUploadConfig,
} from '../Utils/types';
import './UploadForm.scss';
interface Props<T extends string = string> {
  baseUrl: string;
  datasetUploadType: DatasetUploadTypeConfigEntry<T>;
  projectId: string;
  badUploadMessage: State['badUploadMessage'];
  urlParams: Record<string, string>;
  strategyOptions: StrategySummary[];
  resultUploadConfig?: ResultUploadConfig;
  clearBadUpload: () => void;
  submitForm: (newUserDataset: FormSubmission, redirectTo?: string) => void;
  supportedFileUploadTypes: string[];
  maxSizeBytes?: number;
}
type DataUploadSelection =
  | {
      type: 'file';
      file?: File;
    }
  | {
      type: 'url';
      url?: string;
    }
  | {
      type: 'result';
      stepId?: number;
      compatibleRecordTypes?: CompatibleRecordTypes;
    };
type CompleteDataUploadSelection = Required<DataUploadSelection>;
export type FormValidation = InvalidForm | ValidForm;
export interface InvalidForm {
  valid: false;
  errors: string[];
}
export interface ValidForm {
  valid: true;
  submission: FormSubmission;
}
export interface FormSubmission extends Omit<NewUserDataset, 'uploadMethod'> {
  dataUploadSelection: CompleteDataUploadSelection;
}
declare function UploadForm({
  badUploadMessage,
  baseUrl,
  datasetUploadType,
  projectId,
  urlParams,
  strategyOptions,
  resultUploadConfig,
  clearBadUpload,
  submitForm,
  supportedFileUploadTypes,
  maxSizeBytes,
}: Props): JSX.Element;
export default UploadForm;
//# sourceMappingURL=UploadForm.d.ts.map
