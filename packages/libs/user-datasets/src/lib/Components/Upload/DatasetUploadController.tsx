import { NotFoundController } from '@veupathdb/wdk-client/lib/Controllers';

import { UploadTypeMenu } from '../UploadTypeMenu';
import { VdiService, VdiServiceMetadata } from '../../Service';
import { parseDataTypeString } from '../../Common/Configuration/data-types';
import { DatasetFormControllerConfig } from '../../Common/Forms/DatasetFormControllerConfig';
import { configureFormProps, findDatasetTypeConfig } from '../../Common/Configuration';
import { UploadFormController } from './UploadFormController';

export interface DatasetUploadControllerProps
  extends DatasetFormControllerConfig {
  readonly baseUrl: string;
  readonly vdi: VdiService;
  readonly vdiConfig: VdiServiceMetadata;
  readonly type?: string;
  readonly urlParams: Record<string, string>;
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
