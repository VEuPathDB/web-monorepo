import { useCallback } from "react";

import { useDispatch, useSelector } from "react-redux";

import { Loading } from "@veupathdb/wdk-client/lib/Components";
import { useWdkService } from "@veupathdb/wdk-client/lib/Hooks/WdkServiceHook";
import { useSetDocumentTitle } from "@veupathdb/wdk-client/lib/Utils/ComponentUtils";
import { StrategySummary } from "@veupathdb/wdk-client/lib/Utils/WdkUser";

import {
  clearBadUpload,
  receiveBadUpload,
  requestUploadMessages,
  trackUploadProgress,
} from "../Actions/UserDatasetUploadActions";

import { FormSubmission, UploadForm } from "../Components/UploadForm";

import { StateSlice } from "../StoreModules/types";

import { assertIsVdiCompatibleWdkService } from "../Service";
import { NotFoundController } from "@veupathdb/wdk-client/lib/Controllers";
import { UploadFormMenu } from "../Components/UploadFormMenu";
import { UploadFormConfig } from "../Components/FormTypes";
import { projectId } from "@veupathdb/web-common/lib/config";
import { ServiceConfiguration } from "../Service/Types/service-types";
import { EnabledDatasetTypeName } from "@veupathdb/web-common/src/user-dataset-upload-config";

const SUPPORTED_FILE_UPLOAD_TYPES: string[] = [];

interface Props {
  readonly baseUrl: string;
  readonly typeName?: EnabledDatasetTypeName;
  readonly enabledFormConfigs: UploadFormConfig[];
  readonly urlParams: Record<string, string>;
  readonly vdiConfig: ServiceConfiguration;
}

export default function UserDatasetUploadSelector(props: Props) {
  const {
    baseUrl,
    typeName,
    enabledFormConfigs,
    urlParams,
  } = props;

  if (typeName == null && enabledFormConfigs.length !== 1)
    return <UploadFormMenu availableTypes={enabledFormConfigs}/>;

  const formConfig = enabledFormConfigs.find(({ datasetType }) => datasetType.name === typeName);

  if (formConfig == null)
    return <NotFoundController/>;

  return (
    <InnerUserDatasetUploadController
      baseUrl={baseUrl}
      formConfig={formConfig}
      urlParams={urlParams}
    />
  );
}

interface InnerProps {
  readonly baseUrl: string;
  readonly formConfig: UploadFormConfig;
  readonly urlParams: Record<string, string>;
  readonly vdiConfig: ServiceConfiguration;
}

function InnerUserDatasetUploadController({
  baseUrl,
  formConfig,
  urlParams,
}: InnerProps) {
  useSetDocumentTitle(formConfig.uploadTitle);

  const strategyUpload = formConfig.uploadMethodConfigs
    .filter(it => it.kind === "result")
    .map(it => it.asKind("result"))
    .pop();

  const strategyOptions = useWdkService(
    async (wdkService): Promise<StrategySummary[]> => {
      if (!strategyUpload)
        return [];

      const strategies = await wdkService.getStrategies();
      const compatibleRecordTypeNames = new Set(Object.keys(strategyUpload.compatibleRecordTypes));

      return strategies.filter(
        strategy =>
          strategy.recordClassName != null &&
          compatibleRecordTypeNames.has(strategy.recordClassName),
      );
    },
    [ strategyUpload ],
  );

  const badUploadMessage = useSelector(
    (stateSlice: StateSlice) => stateSlice.userDatasetUpload.badUploadMessage,
  );

  const uploadProgress = useSelector(
    (stateSlice: StateSlice) => stateSlice.userDatasetUpload.uploadProgress,
  );

  const dispatch = useDispatch();

  const clearBadUploadMessage = useCallback(() => {
    dispatch(clearBadUpload);
  }, [ dispatch ]);

  const dispatchUploadProgress = useCallback(() => {
    dispatch(trackUploadProgress);
  }, [ dispatch ]);

  const submitForm = useCallback(
    (formSubmission: FormSubmission, baseUrl?: string) => {
      dispatch(async ({ wdkService, transitioner }) => {
        try {
          assertIsVdiCompatibleWdkService(wdkService);
          await (wdkService.vdiService.postDatasetList(
            formSubmission,
            // callback to handle progress events
            (progress: number | null) =>
              dispatch(trackUploadProgress(progress)),
            // callback to redirect to new dataset page
            (datasetId: string) =>
              baseUrl &&
              transitioner.transitionToInternalPage(`${baseUrl}/${datasetId}`),
            // callback to handle bad uploads
            (error: string) => dispatch(receiveBadUpload(error)),
          ));
          return requestUploadMessages();
        } catch (err) {
          return receiveBadUpload(String(err) ?? "Failed to upload dataset");
        }
      });
    },
    [ dispatch ],
  );

  return SUPPORTED_FILE_UPLOAD_TYPES == null || strategyOptions == null
    ? <Loading/>
    : <div className="stack">
      <UploadForm
        baseUrl={baseUrl}
        uploadConfig={formConfig}
        projectId={projectId}
        badUploadMessage={badUploadMessage}
        clearBadUpload={clearBadUploadMessage}
        submitForm={submitForm}
        dispatchUploadProgress={dispatchUploadProgress}
        uploadProgress={uploadProgress?.progress}
        urlParams={urlParams}
        strategyOptions={strategyOptions}
        resultUploadConfig={strategyUpload}
        supportedFileUploadTypes={SUPPORTED_FILE_UPLOAD_TYPES}
        maxSizeBytes={uploadMethod?.asKind("file")?.maxSizeBytes}
      />
    </div>;
}
