import React, {
  JSXElementConstructor,
  ReactElement,
  useEffect,
  useState,
} from 'react';
import { DatasetFormConfig } from '../Configuration';
import { VdiServiceMetadata } from '../../Service';
import { useDispatch, useSelector } from 'react-redux';
import { StateSlice } from '../../StoreModules/types';
import {
  clearBadUpload,
  trackUploadProgress,
} from '../../Actions/UserDatasetUploadActions';
import { DatasetFormProps } from './DatasetFormProps';
import { SubmissionModal } from './Components';

export interface DatasetFormControllerProps<
  P extends DatasetFormProps = DatasetFormProps
> {
  readonly baseUrl: string;
  readonly form: JSXElementConstructor<P>;
  readonly formConfig: DatasetFormConfig;
  readonly vdiConfig: VdiServiceMetadata;
  readonly propFactory: (baseProps: DatasetFormProps) => P;
}

export function DatasetFormController<
  P extends DatasetFormProps = DatasetFormProps
>(props: DatasetFormControllerProps<P>): ReactElement {
  const { form: Form } = props;

  const [submitting, setSubmitting] = useState(false);

  const dispatch = useDispatch();

  const badUploadState = useSelector(
    (stateSlice: StateSlice) => stateSlice.userDatasetUpload.badUploadMessages
  );

  const uploadProgress = useSelector(
    (stateSlice: StateSlice) =>
      stateSlice.userDatasetUpload.uploadProgress?.progress
  );

  useEffect(() => {
    if (badUploadState != null) {
      dispatch(trackUploadProgress(null));
      setSubmitting(false);
    }
  }, [badUploadState, dispatch]);

  useEffect(() => {
    return () => {
      clearBadUpload();
    };
  }, []);

  const formProps = props.propFactory({
    baseUrl: props.baseUrl,
    formConfig: props.formConfig,
    vdiConfig: props.vdiConfig,
    isSubmitting: submitting,
    uploadProgress: uploadProgress ?? null,
    badUploadState: badUploadState,
    actions: {
      submit: notImplemented,
      clearUploadError: clearBadUpload,
      setSubmitting,
    },
  });

  return (
    <div className="stack">
      <Form {...formProps} />

      <SubmissionModal
        submitting={submitting}
        uploadProgress={uploadProgress ?? 0.001}
      />
    </div>
  );
}

function notImplemented() {
  throw new Error('form submission not implemented');
}
