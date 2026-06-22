import React, { ReactElement } from 'react';
import { DatasetDependency, DatasetPostDetails } from '../../../../../Service';
import { Consumer } from '../../../../../Utils';
import { DependenciesConfig } from '../../../../Configuration';

export interface DatasetDependenciesProps {
  readonly datasetDetails: DatasetPostDetails;
  readonly setDatasetDetails: Consumer<DatasetPostDetails>;
  readonly config: DependenciesConfig;
}

export function DatasetDependencies(props: DatasetDependenciesProps): ReactElement {
  const setDependencies = (deps: DatasetDependency[]) =>
    props.setDatasetDetails({ ...props.datasetDetails, dependencies: deps })

  return <>
    <label
      className={props.config.required ? 'required' : ''}
    >Reference Genome</label>
    {props.config.renderInput({
      dependencies: props.datasetDetails.dependencies ?? [],
      setDependencies,
    })}
  </>;
}