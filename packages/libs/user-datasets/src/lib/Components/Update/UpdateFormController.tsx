import React, { ReactElement, useEffect, useMemo, useState } from 'react';
import {
  DatasetGetResponseBody,
  VdiServiceMetadata,
  useVdiService
} from '../../Service';
import { DatasetFormController } from '../../Common/Forms/DatasetFormController';
import { Loading } from '@veupathdb/wdk-client/lib/Components';
import {
  BadUpload,
  DefaultDatasetFormState,
  useDatasetFormState
} from '../../StoreModules/UserDatasetUploadStoreModule';
import { useDispatch } from 'react-redux';
import { clearBadUpload, receiveBadUpload, updateFormState } from '../../Actions/UserDatasetUploadActions';
import { UpdateForm } from './UpdateForm';
import { configureFormProps, findDatasetTypeConfig } from '../../Common/Configuration';
import { DatasetFormControllerConfig } from '../../Common/Forms/DatasetFormControllerConfig';
import { Modal } from '@veupathdb/coreui';
import { Runnable } from '../../Utils';
import { DatasetFormProps } from '../../Common/Forms/DatasetFormProps';
import { convertDetailsToMeta, submitUpdate } from '../../Service/process/update-dataset';

export interface UpdateFormControllerProps extends DatasetFormControllerConfig {
  readonly datasetId: string;
  readonly baseUrl: string;
  readonly vdiConfig: VdiServiceMetadata;
  readonly isPromotingToPublic: boolean;
  readonly closeModal: Runnable;
}

export function UpdateFormController(props: UpdateFormControllerProps): ReactElement {
  const vdi = useVdiService();
  const [ dataset, setDataset ] = useState<DatasetGetResponseBody>();

  const dispatch = useDispatch();
  const formState = useDatasetFormState();

  const onClose = () => {
    props.closeModal();
    dispatch(updateFormState(DefaultDatasetFormState));
    dispatch(clearBadUpload());
  };

  useEffect(
    () => {
      if (vdi && props.datasetId)
        (async () => setDataset(await vdi.getDatasetDetails(props.datasetId)))();
    },
    [ vdi, props.datasetId ],
  );

  useEffect(
    () => {
      let title = '';

      if (!title) {
        title = document.title;
      }

      if (dataset) {
        document.title = `Edit My Dataset: ${dataset?.name}`;
        dispatch(updateFormState({ ...formState, datasetDetails: convertDetailsToMeta(dataset) }))
      }

      return () => { document.title = title; }
    },

    // This should only be triggered when the vdi dataset result changes.
    //
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ dataset ]
  );

  const formConfig = useMemo(
    () => {
      if (!dataset?.type || !vdi)
        return null;

      const type = findDatasetTypeConfig(dataset.type, props.datasetTypes);

      if (!type)
        return null;

      return {
        ...configureFormProps(type, props.formConfigs, vdi),
        // Disable reference genome input for update form
        dependencies: undefined,
      };
    },

    // Excluded values are constant deep trees.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ dataset, vdi ]
  );

  const submitForm = ({ actions: { setSubmitting } }: DatasetFormProps) =>
    () => {
      setSubmitting(true)
      submitUpdate({
        vdi:        vdi!,
        dispatch:   dispatch,
        datasetId:  props.datasetId,
        original:   convertDetailsToMeta(dataset!),
        updated:    formState.datasetDetails,
        files:      formState.fileUploads,
        oldFiles:   dataset!.files.datasetProperties,
      })
        .then(res => {
          setSubmitting(false);

          const errors: BadUpload[] = [];

          if (res.putResult.status === 'process-error') {
            errors.push({
              type: 500,
              message: res.putResult.error,
            });
          } else if (res.putResult.status === 'user-error') {
            for (const error of res.putResult.errors) {
              errors.push({
                type: 400,
                message: `upload ${error.fileName} rejected: ${error.message}`,
              });
            }
          }

          if (res.patchResult.status === 'error') {
            errors.push({
              type: 500,
              message: res.patchResult.message,
            });
          } else if (res.patchResult.status === 'invalid') {
            errors.push({
              type: 422,
              errors: res.patchResult.errors,
            })
          }

          if (errors.length === 0) {
            onClose();
            return;
          }

          dispatch(receiveBadUpload(errors));
        })
        .catch(_ => {
          setSubmitting(false);

          dispatch(receiveBadUpload([{
            type: 500,
            message: 'error encountered while updating dataset'
          }]));
        });
    };

  if (!dataset || !formConfig)
    return <Loading />;

  return<>
    <Modal
      visible={true}
      toggleVisible={onClose}
      includeCloseButton={true}
      title={document.title}
      titleSize="medium"
    >
      <DatasetFormController
        {...props}
        propFactory={p => ({ ...p, actions: {
          ...p.actions,
          submit: submitForm(p),
        }})}
        form={UpdateForm}
        formConfig={formConfig}
      />
    </Modal>
  </>;
}
