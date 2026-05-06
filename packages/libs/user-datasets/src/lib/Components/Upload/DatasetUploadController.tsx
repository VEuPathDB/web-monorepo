import { isEmpty } from 'lodash';

import { NotFoundController } from '@veupathdb/wdk-client/lib/Controllers';

import { DatasetTypeConfig, DatasetTypeSelection } from './Configuration';
import { UploadTypeMenu } from './UploadTypeMenu';
import { UploadFormState, UploadFormController } from './UploadForm';
import {
  configureFormProps,
  UploadFormConfigurators,
} from './Configuration/form-configs';
import { VdiService, VdiServiceMetadata } from '../../Service';
import {
  isSameDataType,
  parseDataTypeString,
} from './Configuration/data-types';
import { Consumer } from '../../Utils';

export interface DatasetUploadControllerConfig {
  readonly formConfigs: UploadFormConfigurators;
  readonly datasetTypes: readonly DatasetTypeConfig[];
}

export interface DatasetUploadControllerProps
  extends DatasetUploadControllerConfig {
  readonly baseUrl: string;
  readonly vdi: VdiService;
  readonly vdiConfig: VdiServiceMetadata;
  readonly type?: string;
  readonly urlParams: Record<string, string>;

  readonly uploadFormState: UploadFormState;
  readonly setUploadFormState: Consumer<UploadFormState>;
}

export function DatasetUploadController({
  vdi,
  formConfigs,
  datasetTypes,
  type,
  ...props
}: DatasetUploadControllerProps) {
  if (!type && datasetTypes.length !== 1)
    return <UploadTypeMenu availableDataTypes={datasetTypes} />;

  const datasetType = type
    ? findDatasetTypeConfig(parseDataTypeString(type), datasetTypes)
    : datasetTypes[0];

  if (!datasetType) return <NotFoundController />;

  const formConfig = configureFormProps(datasetType, formConfigs, vdi);

  return <UploadFormController formConfig={formConfig} {...props} />;
}

function findDatasetTypeConfig(
  type: DatasetTypeSelection,
  configs: readonly DatasetTypeConfig[]
): DatasetTypeConfig | null {
  const hits = configs.filter((dtc) => isSameDataType(type, dtc));

  if (isEmpty(hits)) return null;

  return hits[0];
}
