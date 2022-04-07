import { useCallback } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { useSetDocumentTitle } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { StrategySummary } from '@veupathdb/wdk-client/lib/Utils/WdkUser';

import {
  clearBadUpload,
  submitUploadForm,
} from '../Actions/UserDatasetUploadActions';

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
  useSetDocumentTitle(datasetUploadType.uploadTitle);

  const projectId = useWdkService(
    (wdkService) => wdkService.getConfig().then((config) => config.projectId),
    []
  );

  const strategyOptions = useWdkService(
    async (wdkService): Promise<StrategySummary[]> => {
      if (!datasetUploadType.formConfig.uploadMethodConfig.strategy.offer) {
        return [];
      }

      const strategies = await wdkService.getStrategies();
      const compatibleRecordTypeNames = new Set(
        Object.keys(
          datasetUploadType.formConfig.uploadMethodConfig.strategy
            .compatibleRecordTypes
        )
      );

      return strategies.filter(
        (strategy) =>
          strategy.recordClassName != null &&
          compatibleRecordTypeNames.has(strategy.recordClassName)
      );
    },
    [datasetUploadType.formConfig.uploadMethodConfig.strategy.offer]
  );

  const badUploadMessage = useSelector(
    (stateSlice: StateSlice) => stateSlice.userDatasetUpload.badUploadMessage
  );

  const dispatch = useDispatch();

  const clearBadUploadMessage = useCallback(() => {
    dispatch(clearBadUpload);
  }, [dispatch]);

  const submitForm = useCallback(
    (newUserDataset: NewUserDataset, redirectTo?: string) => {
      dispatch(submitUploadForm(newUserDataset, redirectTo));
    },
    [dispatch]
  );

  return projectId == null || strategyOptions == null ? (
    <Loading />
  ) : (
    <div className="stack">
      <UploadForm
        baseUrl={baseUrl}
        datasetUploadType={datasetUploadType}
        projectId={projectId}
        badUploadMessage={badUploadMessage}
        clearBadUpload={clearBadUploadMessage}
        submitForm={submitForm}
        urlParams={urlParams}
        strategyOptions={strategyOptions}
        strategyUploadConfig={
          datasetUploadType.formConfig.uploadMethodConfig.strategy
        }
      />
    </div>
  );
}
