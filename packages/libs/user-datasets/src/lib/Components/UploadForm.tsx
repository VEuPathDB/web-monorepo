import React, {
  FormEvent,
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
  SingleSelect,
} from "@veupathdb/wdk-client/lib/Components";

import { makeClassNameHelper } from "@veupathdb/wdk-client/lib/Utils/ComponentUtils";
import { StrategySummary } from "@veupathdb/wdk-client/lib/Utils/WdkUser";

import { State } from "../StoreModules/UserDatasetUploadStoreModule";
import {
  CompatibleRecordTypes,
  DatasetUploadTypeConfigEntry,
  ResultUploadConfig,
} from "../Utils/types";

import { Modal } from "@veupathdb/coreui";
import Banner from "@veupathdb/coreui/lib/components/banners/Banner";

import "./UploadForm.scss";

import {
  BioprojectIdRefInputList,
  ContactInputList,
  DoiRefInputList,
  ErrorMessage,
  FieldLabel,
  HyperlinkInputList,
  LinkedDatasetInputList,
  PublicationInputList,
  UploadProgress, useCharacteristicsSegment, useStudyDesignSegment,
} from "./FormComponents";

import {
  DatasetContact,
  DatasetDependency,
  DatasetOrganism,
  DatasetPostRequest,
  DatasetPublication,
  LinkedDataset,
} from "../Service/Types";
import { UserDatasetFormContent } from "./FormTypes";

const cx = makeClassNameHelper("UploadForm");

interface Props<T extends string = string> {
  baseUrl: string;
  datasetUploadType: DatasetUploadTypeConfigEntry<T>;
  projectId: string;
  badUploadMessage: State["badUploadMessage"];
  urlParams: Record<string, string>; // Assume we want to support this for all of our new fields
  strategyOptions: StrategySummary[];
  resultUploadConfig?: ResultUploadConfig;
  clearBadUpload: () => void;
  submitForm: (formSubmission: FormSubmission, baseUrl?: string) => void;
  uploadProgress?: number | null;
  dispatchUploadProgress: (progress: number | null) => void;
  supportedFileUploadTypes: string[];
  maxSizeBytes?: number;
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

interface FormContent extends UserDatasetFormContent {
  dataUploadSelection: DataUploadSelection;
  dependencies?: DatasetDependency[];
}

export type FormValidation = InvalidForm | ValidForm;

export interface InvalidForm {
  valid: false;
  errors: string[];
}

export interface ValidForm {
  valid: true;
  submission: FormSubmission;
}

export interface FormSubmission extends DatasetPostRequest {
  dataUploadSelection: CompleteDataUploadSelection;
}

const TODO = (msg: string) => {
  throw new Error(msg);
};

function UploadForm({
  badUploadMessage,
  baseUrl,
  datasetUploadType,
  projectId,
  urlParams,
  strategyOptions,
  resultUploadConfig,
  clearBadUpload,
  submitForm,
  uploadProgress,
  dispatchUploadProgress,
  supportedFileUploadTypes,
  maxSizeBytes,
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

  const displayUrlUploadMethod =
    datasetUploadType.formConfig.uploadMethodConfig.url?.offer !== false;

  const displayStrategyUploadMethod =
    datasetUploadType.formConfig.uploadMethodConfig.result?.offerStrategyUpload;

  const enableStrategyUploadMethod =
    Boolean(displayStrategyUploadMethod) && strategyOptions.length > 0;

  // region Form State

  const [ name, setName ] = useState(urlParams.datasetName ?? "");
  const [ summary, setSummary ] = useState(urlParams.datasetSummary ?? "");
  const [ description, setDescription ] = useState(urlParams.datasetDescription ?? "");
  const [ dependencies, setDependencies ] = useState<DatasetDependency[]>([]);
  const [ publications, setPublications ] = useState<DatasetPublication[]>([]);
  const [ contacts, setContacts ] = useState<DatasetContact[]>([]);
  const [ projectName, setProjectName ] = useState<string>();
  const [ programName, setProgramName ] = useState<string>();
  const [ linkedDatasets, setLinkedDatasets ] = useState<LinkedDataset[]>([]);
  const [ experimentalOrganism, setExperimentalOrganism ] = useState<DatasetOrganism>();
  const [ hostOrganism, setHostOrganism ] = useState<DatasetOrganism>();


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
        : urlParams.datasetUrl && displayUrlUploadMethod
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
        datasetUploadType,
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
      datasetUploadType,
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

  const nameInputProps = datasetUploadType.formConfig.name?.inputProps;
  const summaryInputProps = datasetUploadType.formConfig.summary?.inputProps;
  const descriptionInputProps =
    datasetUploadType.formConfig.description?.inputProps;

  const summaryRequired = summaryInputProps?.required ?? true;
  const descriptionRequired = descriptionInputProps?.required ?? false;

  const defaultFileInputField = (
    <FileInput
      accept={
        supportedFileUploadTypes
          ?.map((fileUploadType) => `.${fileUploadType}`)
          .join(",") || undefined
      }
      required={dataUploadMode === "file"}
      disabled={dataUploadMode !== "file" || useFixedUploadMethod}
      maxSizeBytes={maxSizeBytes}
      onChange={(file) => {
        const fileWithSpacedRemovedFromName =
          file && new File([ file ], file?.name.replace(/\s+/g, "_"), file);
        setFile(fileWithSpacedRemovedFromName ?? undefined);
      }}
    />
  );
  const renderFileInput =
    datasetUploadType.formConfig.uploadMethodConfig.file?.render;
  const fileInputField =
    renderFileInput == null
      ? defaultFileInputField
      : renderFileInput({ fieldNode: defaultFileInputField });

  const uploadMethodItems = [
    {
      value: "file",
      disabled: useFixedUploadMethod,
      display: (
        <React.Fragment>
          <FieldLabel
            htmlFor="data-set-file"
            required={dataUploadMode === "file"}
          >
            Upload File
          </FieldLabel>
          <div
            id="data-set-file"
            className={cx(
              "--UploadMethodField",
              dataUploadMode !== "file" && "disabled",
            )}
          >
            {fileInputField}
          </div>
        </React.Fragment>
      ),
    },
  ]
    .concat(
      !displayUrlUploadMethod
        ? []
        : [
          {
            value: "url",
            disabled: useFixedUploadMethod,
            display: (
              <React.Fragment>
                <FieldLabel
                  htmlFor="data-set-url"
                  required={dataUploadMode === "url"}
                >
                  Upload URL
                </FieldLabel>
                <TextBox
                  type="input"
                  className={cx(
                    "--UploadMethodField",
                    dataUploadMode !== "url" && "disabled",
                  )}
                  id="data-set-url"
                  placeholder="Address of a data file from the Web"
                  value={url}
                  required={dataUploadMode === "url"}
                  disabled={dataUploadMode !== "url" || useFixedUploadMethod}
                  onChange={setUrl}
                />
              </React.Fragment>
            ),
          },
        ],
    )
    .concat(
      !displayStrategyUploadMethod
        ? []
        : [
          {
            value: "strategy",
            disabled: !enableStrategyUploadMethod || useFixedUploadMethod,
            display: (
              <React.Fragment>
                <FieldLabel
                  htmlFor="data-set-strategy"
                  required={dataUploadMode === "strategy"}
                >
                  Upload Strategy
                </FieldLabel>
                <div
                  id="data-set-strategy"
                  className={cx(
                    "--UploadMethodField",
                    dataUploadMode !== "strategy" && "disabled",
                  )}
                >
                  <SingleSelect
                    value={`${stepId}`}
                    items={strategyOptions.map((option) => ({
                      value: `${option.rootStepId}`,
                      display: `${option.name}${!option.isSaved ? "*" : ""}`,
                    }))}
                    required={dataUploadMode === "strategy"}
                    onChange={(value) => {
                      setStepId(Number(value));
                    }}
                  />
                </div>
              </React.Fragment>
            ),
          },
        ],
    );
  return (
    <form
      className={cx()}
      style={submitting ? { opacity: "0.5" } : {}}
      onSubmit={onSubmit}
    >
      {errorMessages.length > 0 && <ErrorMessage errors={errorMessages}/>}
      <div>
        <h2>{datasetUploadType.uploadTitle}</h2>
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
            Name
          </FieldLabel>
          <TextBox
            type="input"
            id="data-set-name"
            placeholder="name of the data set"
            {...nameInputProps}
            required
            value={name}
            onChange={setName}
          />
        </div>
        <div className="formSection formSection--data-set-summary">
          <FieldLabel htmlFor="data-set-summary" required={summaryRequired}>
            Summary
          </FieldLabel>
          <TextArea
            type="input"
            id="data-set-summary"
            placeholder="brief summary of the data set contents in a few sentences"
            required={summaryRequired}
            rows={2}
            {...summaryInputProps}
            value={summary}
            onChange={setSummary}
          />
        </div>
        <div className="formSection formSection--data-set-description">
          <FieldLabel
            htmlFor="data-set-description"
            required={descriptionRequired}
          >
            Description
          </FieldLabel>
          <TextArea
            id="data-set-description"
            placeholder="longer description of the data set contents"
            required={descriptionRequired}
            rows={6}
            {...descriptionInputProps}
            value={description}
            onChange={setDescription}
          />
        </div>
        <div className="formSection">
          <PublicationInputList records={publications} setRecords={setPublications} />
          <ContactInputList records={contacts} setRecords={setContacts} />
          <LinkedDatasetInputList records={linkedDatasets} setRecords={setLinkedDatasets} />
        </div>
        <div className="formSection externalIdentifiers">
          <DoiRefInputList records={do} setRecords={} />
          <HyperlinkInputList records={} setRecords={} />
          <BioprojectIdRefInputList records={} setRecords={} />
        </div>
        {datasetUploadType.formConfig.dependencies && (
          <div className="formSection formSection--data-set-dependencies">
            <FieldLabel
              required={
                datasetUploadType.formConfig.dependencies.required ?? false
              }
            >
              {datasetUploadType.formConfig.dependencies.label}
            </FieldLabel>
            {datasetUploadType.formConfig.dependencies.render({
              value: dependencies,
              onChange: setDependencies,
            })}
          </div>
        )}
        {
          <div className="formSection formSection--data-set-file">
            {uploadMethodItems.length === 1 ? (
              <div className={cx("--UploadMethodSelector")}>
                <div className={cx("--FixedUploadItem")}>
                  {uploadMethodItems[0].display}
                </div>
              </div>
            ) : (
              <RadioList
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
                items={uploadMethodItems}
              />
            )}
          </div>
        }
      </div>
      <CharacteristicsSegment />
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
      {datasetUploadType.formConfig?.renderInfo?.()}
    </form>
  );
}

function validateForm<T extends string = string>(
  projectId: string,
  datasetUploadType: DatasetUploadTypeConfigEntry<T>,
  enableResultUploadMethod: boolean,
  formContent: FormContent,
): FormValidation {
  const { name, summary, description, dataUploadSelection, dependencies } =
    formContent;

  if (
    datasetUploadType.formConfig.dependencies?.required &&
    dependencies == null
  ) {
    return {
      valid: false,
      errors: [ `Required: ${datasetUploadType.formConfig.dependencies.label}` ],
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
      type: datasetUploadType.type,
      category: datasetUploadType.type === "wrangler" ? "phenotype" : undefined,
      projects: [ projectId ],
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

export default UploadForm;
