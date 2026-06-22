import { EpicDependencies } from '@veupathdb/wdk-client/lib/Core/Store';
import { Dispatch } from 'redux';
import { DatasetFormState } from '../../StoreModules';
import { DatasetFormConfig } from '../Configuration';
import { Consumer } from '../../Utils';

export interface DatasetFormSubmitter {
  (
    resultDispatch: Dispatch<any, EpicDependencies>,
    formState: DatasetFormState,
    formConfig: DatasetFormConfig,
    setSubmitting: Consumer<boolean>,
    baseUrl: string,
  ): void;
}