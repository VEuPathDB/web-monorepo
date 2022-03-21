import { useCallback } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { useSetDocumentTitle } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

import { submitUploadForm } from '../Actions/UserDatasetUploadActions';

import UploadForm from '../Components/UploadForm';

import { StateSlice } from '../StoreModules/types';

import { NewUserDataset } from '../Utils/types';

interface Props {
  baseUrl: string;
  datasetType: string;
  urlParams: Record<string, string>;
}

export default function UserDatasetUploadController({
  baseUrl,
  datasetType,
  urlParams,
}: Props) {
  useSetDocumentTitle('Upload My New Data Set');

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
        datasetType={datasetType}
        projectId={projectId}
        badUploadMessage={badUploadMessage}
        submitForm={submitForm}
        urlParams={urlParams}
      />
    </div>
  );
}
