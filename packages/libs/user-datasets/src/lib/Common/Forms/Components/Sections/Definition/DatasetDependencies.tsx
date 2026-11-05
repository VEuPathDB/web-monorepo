import React, { ReactElement } from 'react';
import {
  DatasetDependency,
  PartialDatasetDetails,
} from '../../../../../Service';
import { Consumer, isNonEmpty } from '../../../../../Utils';
import { DependenciesConfig } from '../../../../Configuration';

export interface DatasetDependenciesProps {
  readonly datasetDetails: PartialDatasetDetails;
  readonly setDatasetDetails: Consumer<PartialDatasetDetails>;
  readonly config: DependenciesConfig;
}

export function DatasetDependencies(
  { datasetDetails, setDatasetDetails, config }: DatasetDependenciesProps
): ReactElement {
  const [valid, setValid] = React.useState(() => isNonEmpty(datasetDetails.dependencies));

  const setDependencies = React.useCallback(
    (deps: DatasetDependency[]) => {
      setDatasetDetails({ ...datasetDetails, dependencies: deps });
      setValid(isNonEmpty(deps));
    },
    [datasetDetails, setDatasetDetails],
  );

  const classNames: Array<string> = [];

  if (config.required) {
    classNames.push('required');
  }

  if (!valid) {
    classNames.push('invalid');
  }

  return (
    <>
      <label className={classNames.join(' ')}>
        Reference Organism
      </label>
      {config.renderInput({
        dependencies: datasetDetails.dependencies ?? [],
        setDependencies,
      })}
    </>
  );
}
