import React, { ReactElement, useEffect, useMemo, useState } from 'react';
import {
  DatasetGetResponseBody,
  DatasetPostDetails,
  useVdiService,
  VdiService,
  VdiServiceMetadata
} from '../../Service';
import { DatasetFormController } from '../../Common/Forms/DatasetFormController';
import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { identity } from 'lodash';
import { useDatasetFormState } from '../../StoreModules/UserDatasetUploadStoreModule';
import { useDispatch } from 'react-redux';
import { updateFormState } from '../../Actions/UserDatasetUploadActions';
import { UpdateForm } from './UpdateForm';
import { configureFormProps, findDatasetTypeConfig } from '../../Common/Configuration';
import { DatasetFormControllerConfig } from '../../Common/Forms/DatasetFormControllerConfig';
import { Modal } from '@veupathdb/coreui';
import { Runnable } from '../../Utils';

export interface UpdateFormControllerProps extends DatasetFormControllerConfig {
  readonly datasetId: string;
  readonly baseUrl: string;
  readonly vdiConfig: VdiServiceMetadata;
  readonly isPromotingToPublic: boolean;
  readonly closeModal: Runnable;
}

export function UpdateFormController(props: UpdateFormControllerProps): ReactElement {
  const vdi = useVdiService<VdiService>(identity);
  const [ dataset, setDataset ] = useState<DatasetGetResponseBody>();

  const dispatch = useDispatch();
  const formState = useDatasetFormState();

  useEffect(() => {
    if (vdi && props.datasetId)
      (async () => setDataset(await vdi.getDatasetDetails(props.datasetId)))();
  }, [ vdi, props.datasetId ]);

  useEffect(
    () => {
      let title = '';

      if (!title) {
        title = document.title;
      }

      if (dataset) {
        document.title = `Edit My Dataset: ${dataset?.name}`;
        dispatch(updateFormState({ ...formState, datasetDetails: convertMeta(dataset) }))
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

    // Excluded values are constant deep trees.  Re-examining them is needless
    // at best, and expensive at worst.
    //
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ dataset, vdi ]
  );


  if (!dataset || !formConfig)
    return <Loading />;

  return<>
    <Modal
      visible={true}
      toggleVisible={props.closeModal}
      includeCloseButton={true}
      title={document.title}
      titleSize="medium"
    >
      <DatasetFormController
        {...props}
        propFactory={identity}
        form={UpdateForm}
        formConfig={formConfig}
      />
    </Modal>
  </>;
}

/**
 * "Convert" the response object to by pruning out derived fields returned by
 * VDI that are not parts of the dataset's metadata.
 */
function convertMeta(meta: DatasetGetResponseBody): DatasetPostDetails {
  return {
    name: meta.name,
    summary: meta.summary,
    dependencies: meta.dependencies,
    description: meta.description,
    publications: meta.publications,
    contacts: meta.contacts,
    projectName: meta.projectName,
    programName: meta.programName,
    linkedDatasets: meta.linkedDatasets,
    experimentalOrganism: meta.experimentalOrganism,
    hostOrganism: meta.hostOrganism,
    datasetCharacteristics: meta.datasetCharacteristics,
    externalIdentifiers: meta.externalIdentifiers,
    funding: meta.funding,
    shortAttribution: meta.shortAttribution,
    daysForApproval: meta.daysForApproval,
    dataDisclaimer: meta.dataDisclaimer,
    datasetSources: meta.datasetSources,
  };
}
