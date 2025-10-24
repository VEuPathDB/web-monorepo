import React, {
  Dispatch,
  FormEvent, ReactElement, ReactNode, SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";

import { keyBy } from "lodash";

import {
  TextBox,
  TextArea,
  FileInput,
  RadioList,
} from "@veupathdb/wdk-client/lib/Components";

import { makeClassNameHelper } from "@veupathdb/wdk-client/lib/Utils/ComponentUtils";
import { StrategySummary } from "@veupathdb/wdk-client/lib/Utils/WdkUser";

import { State } from "../StoreModules/UserDatasetUploadStoreModule";
import {
  CompatibleRecordTypes,
  ResultUploadConfig,
} from "../Utils/types";

import { Modal } from "@veupathdb/coreui";
import Banner from "@veupathdb/coreui/lib/components/banners/Banner";

import "./UploadForm.scss";

import {
  ContactInputList,
  ErrorMessage,
  FieldLabel,
  LinkedDatasetInputList,
  PublicationInputList,
  UploadProgress,
  useCharacteristicsSegment,
  useStudyDesignSegment,
} from "./FormSegments";

import {
  DatasetContact,
  DatasetDependency,
  DatasetPostRequest,
  DatasetPublication,
  LinkedDataset,
} from "../Service/Types";
import { DataInputConfig, UploadFormConfig, VariableDisplayText } from "./FormTypes";
import { ServiceConfiguration } from "../Service/Types/service-types";
import { DataInputKind } from "./FormTypes/form-config";
import { DataFileInput, DataSourceURLInput, StrategyDataInput } from "./FormSegments/DataInputs";

const cx = makeClassNameHelper("UploadForm");

interface Props {
  baseUrl: string;
  uploadConfig: UploadFormConfig;
  projectId: string;
  badUploadMessage: State["badUploadMessage"];
  urlParams: Record<string, string>; // Assume we want to support this for all of our new fields
  strategyOptions: StrategySummary[];
  resultUploadConfig?: ResultUploadConfig;
  clearBadUpload: () => void;
  submitForm: (formSubmission: FormSubmission, baseUrl?: string) => void;
  uploadProgress?: number | null;
  dispatchUploadProgress: (progress: number | null) => void;
  displayText: VariableDisplayText;
  vdiConfig: ServiceConfiguration,
}

type DataUploadMode = "file" | "url" | "strategy" | "step";

type DataUploadSelection =
  | { type: "file"; file?: File }
  | { type: "url"; url?: string }
  | {
  type: "result";
  stepId?: number;
  compatibleRecordTypes?: CompatibleRecordTypes;
};

type CompleteDataUploadSelection = Required<DataUploadSelection>;

interface InvalidForm {
  valid: false;
  errors: string[];
}

interface ValidForm {
  valid: true;
  submission: FormSubmission;
}

export type FormValidation = InvalidForm | ValidForm;

export interface FormSubmission extends DatasetPostRequest {
  dataUploadSelection: CompleteDataUploadSelection;
}

const TODO = (msg: string) => {
  throw new Error(msg);
};

interface UploadMethodItem {
  readonly value: DataInputKind;
  readonly display: NonNullable<ReactNode>;
}

export function UploadForm({
  badUploadMessage,
  baseUrl,
  uploadConfig,
  projectId,
  urlParams,
  strategyOptions,
  resultUploadConfig,
  clearBadUpload,
  submitForm,
  uploadProgress,
  dispatchUploadProgress,
  displayText,
  vdiConfig,
}: Props) {
  const strategyOptionsByStrategyId = useMemo(
    () => keyBy(strategyOptions, (option) => option.strategyId),
    [ strategyOptions ],
  );

  const { useFixedUploadMethod: useFixedUploadMethodStr } = urlParams;

  const useFixedUploadMethod = useMemo(
    () => useFixedUploadMethodStr === "true",
    [ useFixedUploadMethodStr ],
  );

  const displayUrlUpload = uploadConfig.uploadMethodConfigs
    .some(config => config.asKind("url")?.offer === true);

  const displayStrategyUpload = uploadConfig.uploadMethodConfigs
    .some(config => config.asKind("result")?.offerStrategyUpload === true);

  const enableStrategyUploadMethod = displayStrategyUpload && strategyOptions.length > 0;

  // region Form State

  const [ name, setName ] = useState(urlParams.datasetName ?? "");
  const [ summary, setSummary ] = useState(urlParams.datasetSummary ?? "");
  const [ description, setDescription ] = useState(urlParams.datasetDescription ?? "");
  const [ dependencies, setDependencies ] = useState<DatasetDependency[]>([]);
  const [ publications, setPublications ] = useState<DatasetPublication[]>([]);
  const [ contacts, setContacts ] = useState<DatasetContact[]>([]);
  const [ linkedDatasets, setLinkedDatasets ] = useState<LinkedDataset[]>([]);


  const designInCharacteristics = false;

  const [ studyDesign, setStudyDesign ] = useState<string>();
  const [ studyType, setStudyType ] = useState<string>();
  const [ StudyDesignSegment, validateStudyDesign ] = useStudyDesignSegment({
    designValue: studyDesign,
    onChangeDesign: setStudyDesign,
    typeValue: studyType,
    onChangeType: setStudyType,

    fetchTypeTerms: TODO("where do the terms come from?"),
    requireDesign: TODO("design required for mbio and ce"),
    designTerms: TODO("get these from the model?"),
  });

  const { CharacteristicsSegment, ...characteristics } = useCharacteristicsSegment({
    StudyDesignSegment: designInCharacteristics
      ? StudyDesignSegment
      : () => <></>,
  });

  const [ dataUploadMode, setDataUploadMode ] = useState<DataUploadMode>(
    urlParams.datasetStepId
      ? "step"
      : urlParams.datasetStrategyRootStepId && enableStrategyUploadMethod
        ? "strategy"
        : urlParams.datasetUrl && displayUrlUpload
          ? "url"
          : "file",
  );
  const [ file, setFile ] = useState<File>();
  const [ url, setUrl ] = useState(urlParams.datasetUrl ?? "");

  // endregion Form State

  const initialStepId = useMemo(() => {
    const parsedStepIdParam = Number(urlParams.datasetStepId);

    if (isFinite(parsedStepIdParam)) {
      return parsedStepIdParam;
    }

    const parsedStrategyIdParam = Number(urlParams.datasetStrategyId);

    return !enableStrategyUploadMethod || !isFinite(parsedStrategyIdParam)
      ? strategyOptions[0]?.rootStepId
      : strategyOptionsByStrategyId[parsedStrategyIdParam]?.rootStepId;
  }, [
    urlParams.datasetStepId,
    urlParams.datasetStrategyId,
    strategyOptions,
    strategyOptionsByStrategyId,
    enableStrategyUploadMethod,
  ]);
  const [ stepId, setStepId ] = useState(initialStepId);

  useEffect(() => {
    setStepId(initialStepId);
  }, [ initialStepId ]);

  const [ errorMessages, setErrorMessages ] = useState<string[]>([]);
  const [ submitting, setSubmitting ] = useState(false);

  const dataUploadSelection = useMemo((): DataUploadSelection => {
    if (dataUploadMode === "file") {
      return { type: "file", file };
    }

    if (dataUploadMode === "url") {
      return { type: "url", url };
    }

    if (resultUploadConfig == null) {
      throw new Error("This data set type does not support result uploads.");
    }

    if (stepId == null) {
      return { type: "result" };
    }

    return {
      type: "result",
      stepId,
      compatibleRecordTypes: resultUploadConfig.compatibleRecordTypes,
    };
  }, [ dataUploadMode, file, url, resultUploadConfig, stepId ]);

  const onSubmit = useCallback(
    (event: FormEvent) => {
      event.preventDefault();

      const formValidation = validateForm(
        projectId,
        uploadConfig,
        enableStrategyUploadMethod,
        {
          name,
          summary,
          description,
          dataUploadSelection,
          dependencies,
          publications,
          linkedDatasets: linkedDatasets,
          contacts,
        },
      );

      if (!formValidation.valid) {
        setErrorMessages(formValidation.errors);
      } else {
        setSubmitting(true);
        submitForm(formValidation.submission, baseUrl);
      }
    },
    [
      baseUrl,
      projectId,
      uploadConfig,
      enableStrategyUploadMethod,
      name,
      summary,
      description,
      dependencies,
      dataUploadSelection,
      submitForm,
      publications,
      linkedDatasets,
      contacts,
    ],
  );

  useEffect(() => {
    if (badUploadMessage != null) {
      dispatchUploadProgress(null);
      setErrorMessages([ badUploadMessage.message ]);
      setSubmitting(false);
    }
  }, [ badUploadMessage, dispatchUploadProgress ]);

  useEffect(() => clearBadUpload, [ clearBadUpload ]);


  const uploadMethodItems: Array<() => UploadMethodItem> = uploadConfig.uploadMethodConfigs.map(config => {
    switch (config.kind) {
      case "file":
        return () => {
          return {
            value: config.kind,
            display: DataFileInput({
              inputConstructor: config.asKind("file")?.render
                ? baseInput
                : () => render!!({
                  formField: baseInput(),
                  installer: uploadConfig.installer,
                  vdiConfig,
                }),
            }),
          };
        };
      case "url":
        return () => ({
          value: config.kind,
          display: DataSourceURLInput({ url, setUrl }),
        });
      case "result":
        return () => ({
          value: config.kind,
          display: StrategyDataInput({ stepId, setStepId, strategyOptions }),
        });
      default:
        throw new Error(`illegal state: invalid upload type '${(config as DataInputConfig).kind}'`)
    }
  });

  return (
    <form
      className={cx()}
      style={submitting ? { opacity: "0.5" } : {}}
      onSubmit={onSubmit}
    >
      {errorMessages.length > 0 && <ErrorMessage errors={errorMessages}/>}
      <div>
        <h2>{uploadConfig.uploadTitle}</h2>
        <Banner
          banner={{
            type: "warning",
            message: (
              <>
                Before uploading your dataset, please ensure your data is
                formatted according to the instructions listed in the{" "}
                <Link to={{ pathname: `${baseUrl}/help` }}>"Help" tab</Link>.
              </>
            ),
          }}
        />
        <div className="formSection formSection--data-set-name">
          <FieldLabel required htmlFor="data-set-name">
            {displayText.datasetNameLabel}
          </FieldLabel>
          <TextBox
            type="input"
            id="data-set-name"
            required
            value={name}
            onChange={setName}
          />
        </div>
        <div className="formSection formSection--data-set-summary">
          <FieldLabel htmlFor="data-set-summary">Summary</FieldLabel>
          <TextBox
            type="input"
            id="data-set-summary"
            placeholder={displayText.summaryPlaceholder}
            required={true}
            value={summary}
            onChange={setSummary}
          />
        </div>
        <div className="formSection formSection--data-set-description">
          <FieldLabel htmlFor="data-set-description">Description</FieldLabel>
          <TextArea
            id="data-set-description"
            placeholder="longer description of the data set contents"
            rows={6}
            value={description}
            onChange={setDescription}
          />
        </div>
        <div className="formSection">
          <PublicationInputList records={publications} setRecords={setPublications}/>
          <ContactInputList records={contacts} setRecords={setContacts}/>
          <LinkedDatasetInputList records={linkedDatasets} setRecords={setLinkedDatasets}/>
        </div>
        {/*<div className="formSection externalIdentifiers">*/}
        {/*  <DoiRefInputList records={} setRecords={} />*/}
        {/*  <HyperlinkInputList records={} setRecords={} />*/}
        {/*  <BioprojectIdRefInputList records={} setRecords={} />*/}
        {/*</div>*/}
        {uploadConfig.dependencies && (
          <div className="formSection formSection--data-set-dependencies">
            <FieldLabel>
              {uploadConfig.dependencies.label}
            </FieldLabel>
            {uploadConfig.dependencies.render({
              value: dependencies,
              onChange: setDependencies,
            })}
          </div>
        )}
        {
          <div className="formSection formSection--data-set-file">
            {uploadMethodItems.length === 1
              ? <div className={cx("--UploadMethodSelector")}>
                <div className={cx("--FixedUploadItem")}>
                  {uploadMethodItems[0]().display}
                </div>
              </div>
              : <RadioList
                name="data-set-radio"
                className={cx("--UploadMethodSelector")}
                value={dataUploadMode}
                onChange={(value) => {
                  if (
                    value !== "url" &&
                    value !== "file" &&
                    value !== "strategy"
                  ) {
                    throw new Error(
                      `Unrecognized upload method '${value}' encountered.`,
                    );
                  }
                  setDataUploadMode(value);
                }}
                items={uploadMethodItems.map(it => it())}
              />
            }
          </div>
        }
      </div>
      {CharacteristicsSegment}
      <button type="submit" className="btn" disabled={submitting}>
        Upload Data Set
      </button>
      <Modal
        visible={submitting && Boolean(uploadProgress)}
        toggleVisible={() => null}
        styleOverrides={{
          content: {
            size: {
              height: "100%",
              width: "100%",
            },
            padding: {
              right: 10,
              left: 10,
            },
          },
          size: {
            height: 150,
            width: "auto",
          },
        }}
      >
        <UploadProgress uploadProgress={uploadProgress}/>
      </Modal>
      {uploadConfig?.renderFormFooterInfo?.(uploadConfig.uploadMethodConfigs)}
    </form>
  );
}

function validateForm(
  projectId: string,
  datasetUploadType: UploadFormConfig,
  enableResultUploadMethod: boolean,
  formContent: {
    name: string;
    summary: string;
    description: string;
    dataUploadSelection: { type: "file"; file?: File } | { type: "url"; url?: string } | {
      type: "result";
      stepId?: number;
      compatibleRecordTypes?: CompatibleRecordTypes
    };
    dependencies: DatasetDependency[];
    publications: DatasetPublication[];
    linkedDatasets: LinkedDataset[];
    contacts: DatasetContact[]
  },
): FormValidation {
  const { name, summary, description, dataUploadSelection, dependencies } =
    formContent;

  if (
    datasetUploadType.dependencies != null &&
    dependencies == null
  ) {
    return {
      valid: false,
      errors: [ `Required: ${datasetUploadType.dependencies.label}` ],
    };
  }

  if (!isCompleteDataUploadSelection(dataUploadSelection)) {
    return {
      valid: false,
      errors: !enableResultUploadMethod
        ? [ "Required: data file or URL" ]
        : [ "Required: data file, URL, or strategy" ],
    };
  }

  if (
    dataUploadSelection.type === "url" &&
    !isValidUrl(dataUploadSelection.url)
  ) {
    return {
      valid: false,
      errors: [
        "The provided data URL does not seem valid. A valid URL must start with \"http://\" or \"https://\".",
      ],
    };
  }

  return {
    valid: true,
    submission: {
      name,
      summary,
      description,
      origin: "direct-upload",
      type: datasetUploadType.installer.type,
      installTargets: [ projectId ],
      dataUploadSelection,
      dependencies: dependencies ?? [],
      visibility: "private",
    },
  };
}


function isCompleteDataUploadSelection(
  dataUploadSelection: DataUploadSelection,
): dataUploadSelection is CompleteDataUploadSelection {
  return Object.values(dataUploadSelection).every((value) => value != null);
}

// https://stackoverflow.com/a/43467144
function isValidUrl(string: string) {
  let url: URL;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}
