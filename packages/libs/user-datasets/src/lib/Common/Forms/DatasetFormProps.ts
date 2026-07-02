import { DatasetFormConfig } from '../Configuration';
import { VdiServiceMetadata } from '../../Service';
import { Consumer, Runnable } from '../../Utils';
import { BadUpload } from '../../StoreModules';

export interface DatasetFormProps {
  readonly baseUrl: string;
  readonly formConfig: DatasetFormConfig;
  readonly vdiConfig: VdiServiceMetadata;

  readonly isSubmitting: boolean;
  readonly uploadProgress: number | null;

  readonly badUploadState?: BadUpload[];

  readonly actions: DatasetFormActions;
}

export interface DatasetFormActions {
  /**
   * Action to be executed when the user submits the form.
   */
  readonly submit: Runnable;

  /**
   * Action to be executed to clear the upload error banner.
   */
  readonly clearUploadError: Runnable;

  /**
   * Toggle whether the form is in a 'submitting' state, and should become
   * uneditable.
   */
  readonly setSubmitting: Consumer<boolean>;
}
