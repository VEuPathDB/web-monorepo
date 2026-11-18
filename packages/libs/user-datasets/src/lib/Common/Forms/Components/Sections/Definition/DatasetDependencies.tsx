import React, { ReactElement } from 'react';
import { DatasetDependency } from '../../../../../Service';
import { isNonEmpty } from '../../../../../Utils';
import { DependenciesConfig } from '../../../../Configuration';
import { useDispatch } from 'react-redux';
import { useDependencies } from '../../../Hooks/dataset-metadata-hooks';
import { overwriteMetaField } from '../../../../../Actions/DatasetMetadataFormActions';

export interface DatasetDependenciesProps {
  readonly config: DependenciesConfig;
}

export function DatasetDependencies(
  { config }: DatasetDependenciesProps
): ReactElement {
  const dispatch = useDispatch();
  const dependencies = useDependencies();

  const isValid = isNonEmpty(dependencies);

  const setDependencies = React.useCallback(
    (deps: ReadonlyArray<DatasetDependency>) =>
      dispatch(overwriteMetaField('dependencies', deps)),
    [dispatch],
  );

  const classNames: Array<string> = [];

  if (config.required) {
    classNames.push('required');
  }

  if (!isValid) {
    classNames.push('invalid');
  }

  return (
    <>
      <label className={classNames.join(' ')}>
        Reference organism(s)
      </label>
      {config.renderInput({
        dependencies: dependencies ?? [],
        setDependencies,
      })}
    </>
  );
}
