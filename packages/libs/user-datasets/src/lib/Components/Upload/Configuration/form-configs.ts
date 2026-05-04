import {
  DatasetUploadConfig,
  DatasetTypeConfig,
} from './index';
import { VdiService } from '../../../Service';
import {
  DatasetTypeSelection,
  isSameDataType,
} from './data-types';

export type UploadFormPropConstructor = (
  dataType: DatasetTypeConfig,
  vdi: VdiService,
) => DatasetUploadConfig;

type UploadFormConfiguratorItem = readonly [
  DatasetTypeSelection,
  UploadFormPropConstructor,
];

export type UploadFormConfigurators = readonly UploadFormConfiguratorItem[];

export function configureFormProps(
  dataType: DatasetTypeConfig,
  generators: UploadFormConfigurators,
  vdi: VdiService
): DatasetUploadConfig {
  const hits = generators.filter(([dt, _]) => isSameDataType(dataType, dt));

  if (hits.length !== 1)
    throw new Error('illegal state: more than one data type configuration with the same name:version pair')

  return hits[0][1](dataType, vdi);
}
