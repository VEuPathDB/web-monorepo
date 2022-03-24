import { useCallback } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { useSetDocumentTitle } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

import { submitUploadForm } from '../Actions/UserDatasetUploadActions';

import UploadForm from '../Components/UploadForm';

import { StateSlice } from '../StoreModules/types';

import { DatasetUploadTypeConfigEntry, NewUserDataset } from '../Utils/types';

interface Props<T extends string = string> {
  baseUrl: string;
  datasetUploadType: DatasetUploadTypeConfigEntry<T>;
  urlParams: Record<string, string>;
}

export default function UserDatasetUploadController({
  baseUrl,
  datasetUploadType,
  urlParams,
}: Props) {
  useSetDocumentTitle(`${datasetUploadType.uploadTitle}`);

  const projectId = useWdkService(
    (wdkService) => wdkService.getConfig().then((config) => config.projectId),
    []
  );

  const badUploadMessage = useSelector(
    (stateSlice: StateSlice) => stateSlice.userDatasetUpload.badUploadMessage
  );

  const dispatch = useDispatch();

  const submitForm = useCallback(
    (newUserDataset: NewUserDataset, redirectTo?: string) => {
      dispatch(submitUploadForm(newUserDataset, redirectTo));
    },
    [dispatch]
  );

  return projectId == null ? (
    <Loading />
  ) : (
    <div className="stack">
      <UploadForm
        baseUrl={baseUrl}
        datasetUploadType={datasetUploadType}
        projectId={projectId}
        badUploadMessage={badUploadMessage}
        submitForm={submitForm}
        urlParams={urlParams}
      />
    </div>
  );
}
