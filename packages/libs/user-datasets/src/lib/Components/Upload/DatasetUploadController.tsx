import { isEmpty } from 'lodash';

import { NotFoundController } from '@veupathdb/wdk-client/lib/Controllers';

import { DatasetTypeConfig, DatasetTypeSelection } from './Configuration';
import { UploadTypeMenu } from './UploadTypeMenu';
import UploadFormController from './UploadForm';
import { configureFormProps, UploadFormConfigurators } from "./Configuration/form-configs";
import { VdiService } from '../../Service';
import { isSameDataType, parseDataTypeString } from "./Configuration/data-types";
import { VdiServiceMetadata } from "../../Service/model/response-decoders";

export interface DatasetUploadControllerConfig {
  readonly formConfigs: UploadFormConfigurators;
  readonly datasetTypes: readonly DatasetTypeConfig[];
}

export interface DatasetUploadControllerProps extends DatasetUploadControllerConfig {
  readonly baseUrl: string;
  readonly vdi: VdiService;
  readonly vdiConfig: VdiServiceMetadata;
  readonly type?: string;
  readonly urlParams: Record<string, string>;
}

export function DatasetUploadController({
  baseUrl,
  vdi,
  vdiConfig,
  formConfigs,
  urlParams,
  datasetTypes,
  type,
}: DatasetUploadControllerProps) {
  if (!type && datasetTypes.length !== 1)
    return <UploadTypeMenu availableDataTypes={datasetTypes} />;

  const datasetType = type
    ? findDatasetTypeConfig(parseDataTypeString(type), datasetTypes)
    : datasetTypes[0];

  if (!datasetType)
    return <NotFoundController />;

  const formConfig = configureFormProps(datasetType, formConfigs, vdi);

  return (
    <UploadFormController
      baseUrl={baseUrl}
      formConfig={formConfig}
      vdiConfig={vdiConfig}
      urlParams={urlParams}
    />
  );
}

function findDatasetTypeConfig(type: DatasetTypeSelection, configs: readonly DatasetTypeConfig[]): DatasetTypeConfig | null {
  const hits = configs.filter((dtc) => isSameDataType(type, dtc));

  if (isEmpty(hits))
    return null;

  return hits[0];
}
