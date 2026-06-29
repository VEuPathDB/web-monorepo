import { NotFoundController } from '@veupathdb/wdk-client/lib/Controllers';

import { UploadTypeMenu } from '../UploadTypeMenu';
import { useVdiService, VdiService, VdiServiceMetadata } from '../../Service';
import { parseDataTypeString } from '../../Common/Configuration/data-types';
import { DatasetFormControllerConfig } from '../../Common/Forms/DatasetFormControllerConfig';
import { configureFormProps, findDatasetTypeConfig } from '../../Common/Configuration';
import { UploadFormController } from './UploadFormController';
import { Loading } from '@veupathdb/wdk-client/lib/Components';

export interface DatasetUploadControllerProps
  extends DatasetFormControllerConfig {
  readonly baseUrl: string;
  readonly vdiConfig: VdiServiceMetadata;
  readonly type?: string;
  readonly urlParams: Record<string, string>;
}

export function DatasetUploadController({
  formConfigs,
  datasetTypes,
  type,
  ...props
}: DatasetUploadControllerProps) {
  const vdi = useVdiService();

  if (!vdi) {
    return <Loading />;
  }

  if (!type && datasetTypes.length !== 1) {
    return <UploadTypeMenu availableDataTypes={datasetTypes} />;
  }

  const datasetType = type
    ? findDatasetTypeConfig(parseDataTypeString(type), datasetTypes)
    : datasetTypes[0];

  if (!datasetType) return <NotFoundController />;

  const formConfig = configureFormProps(datasetType, formConfigs, vdi);

  return <UploadFormController formConfig={formConfig} {...props} />;
}
