import { PartialDatasetDetails } from '../../Service';
import { isEmpty } from 'lodash';
import { DatasetFormConfig } from '../Configuration';
import { RefObject } from 'react';

export function isDatasetFormValid(
  metadata: PartialDatasetDetails,
  config: DatasetFormConfig,
  uploadSection: RefObject<HTMLElement>
): boolean {
  const allInputsValid =
    uploadSection.current?.querySelectorAll(':invalid').length === 0;

  const noCustomErrors =
    uploadSection.current?.querySelectorAll('.invalid').length === 0;

  const missingDependencies =
    config.dependencies?.required === true && isEmpty(metadata.dependencies);

  return allInputsValid && noCustomErrors && !missingDependencies;
}
