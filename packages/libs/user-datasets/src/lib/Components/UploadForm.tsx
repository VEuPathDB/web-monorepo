import React, { FormEvent, useCallback, useEffect, useState } from "react";

import { Link } from "react-router-dom";

import { TextArea } from "@veupathdb/wdk-client/lib/Components";

import { makeClassNameHelper } from "@veupathdb/wdk-client/lib/Utils/ComponentUtils";
import { StrategySummary } from "@veupathdb/wdk-client/lib/Utils/WdkUser";

import { State } from "../StoreModules/UserDatasetUploadStoreModule";
import { ResultUploadConfig } from "../Utils/types";

import { Modal } from "@veupathdb/coreui";
import Banner from "@veupathdb/coreui/lib/components/banners/Banner";

import "./UploadForm.scss";

import {
  AdditionalInformation,
  BioprojectIdRefInputList,
  ContactInputList,
  DoiRefInputList,
  ErrorMessage,
  FieldLabel,
  HyperlinkInputList,
  LinkedDatasetInputList,
  PublicationInputList,
  UploadProgress,
} from "./FormSegments";

import { DatasetPostRequest, DatasetPublication } from "../Service/Types";
import {
  DatasetFormData,
  DataUpload,
  DataUploadType,
  MetaFileUpload,
  UploadFormConfig,
} from "./FormTypes";
import { ServiceConfiguration } from "../Service/Types/service-types";
import { ClinEpiDatasetDetails } from "./FormSegments/Required/ClinEpiDatasetDetails";
import { projectId } from "@veupathdb/web-common/lib/config";
import { MBioDatasetDetails } from "./FormSegments/Required/MBioDatasetDetails";
import { GenomicsDatasetDetails } from "./FormSegments/Required/GenomicsDatasetDetails";
import { RequiredInformationProps } from "./FormSegments/Required/common";
import { UrlParams } from "./FormTypes/form-config";
import { CharacteristicsSegment } from "./FormSegments/DatasetCharacteristics";
import { DisplayText } from "@veupathdb/web-common/src/user-dataset-upload-config";
import { transform } from "../Utils/utils";
import { createRootListSectionProps, createSubListSectionProps } from "../Utils/field-selectors";
import { Fundamentals } from "./FormSegments/Fundamental";

const cx = makeClassNameHelper("UploadForm");

interface Props {
  baseUrl: string;
  formConfig: UploadFormConfig;
  badUploadMessage: State["badUploadMessage"];
  urlParams: UrlParams,
  strategyOptions: StrategySummary[];
  resultUploadConfig?: ResultUploadConfig;
  displayText: DisplayText;
  clearBadUpload: () => void;
  submitForm: (formSubmission: FormSubmission, baseUrl?: string) => void;
  uploadProgress?: number | null;
  dispatchUploadProgress: (progress: number | null) => void;
  vdiConfig: ServiceConfiguration,
}

interface InvalidForm {
  valid: false;
  errors: string[];
}

interface ValidForm {
  valid: true;
  submission: FormSubmission;
}

export type FormValidation = InvalidForm | ValidForm;

export interface FormSubmission {
  readonly metadata: DatasetPostRequest;
  readonly data: DataUpload;
  readonly docs: MetaFileUpload[];
}

export function UploadForm({
  badUploadMessage,
  baseUrl,
  formConfig,
  urlParams,
  displayText,
  strategyOptions,
  resultUploadConfig,
  clearBadUpload,
  submitForm,
  uploadProgress,
  dispatchUploadProgress,
  vdiConfig,
}: Props) {
  const [ dsDetails, setDsDetails ] = useState<Partial<DatasetPostRequest>>(() => ({
    installTargets: [ projectId ],
    name: urlParams.datasetName,
    summary: urlParams.datasetSummary,
    dependencies: [],
    description: urlParams.datasetDescription,
    origin: "direct-upload",
    publications: [{} as DatasetPublication],
  }));

  const dataUploadState = useState<DataUpload>();
  const dictFileState = useState<File>();
  const docFileState = useState<MetaFileUpload[]>([]);

  const [ errorMessages, setErrorMessages ] = useState<string[]>([]);
  const [ submitting, setSubmitting ] = useState(false);

  const onSubmit = useCallback(
    (event: FormEvent) => {
      event.preventDefault();

      const formValidation = validateForm(
        formConfig,
        displayText.formDisplay,
        dsDetails,
        dataUploadState[0],
        docFileState[0],
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
      displayText.formDisplay,
      docFileState,
      dsDetails,
      submitForm,
      formConfig,
      dataUploadState,
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

  const requiredDetailsSection = transform(
    {
      formConfig,
      displayText,
      vdiConfig,
      urlParams,
      strategyOptions,
      resultUploadConfig,
      dataUploadState,
      docFileState,
      metaFormState: [ dsDetails, setDsDetails ],
    } as RequiredInformationProps,
    props => {
      switch (projectId) {
        case "ClinEpiDB": return ClinEpiDatasetDetails(props)
        case "MicrobiomeDB": return MBioDatasetDetails(props)
        default: return GenomicsDatasetDetails(props)
      }
    }
  )

  return (
    <form
      className={cx()}
      style={submitting ? { opacity: "0.5" } : {}}
      onSubmit={onSubmit}
    >
      {errorMessages.length > 0 && <ErrorMessage errors={errorMessages}/>}
      <div>
        <h2>{formConfig.uploadTitle}</h2>
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
        {requiredDetailsSection}

        <AdditionalInformation
          displayText={displayText.formDisplay.additionalInfo}
          formDataState={[dsDetails, setDsDetails]}
          dictFileState={dictFileState}
          docFileState={docFileState} />

        <div className="formSection formSection--data-set-description">
          <FieldLabel htmlFor="data-set-description">Description</FieldLabel>
          <TextArea
            id="data-set-description"
            placeholder="longer description of the data set contents"
            rows={6}
            value={dsDetails.description}
            onChange={description => setDsDetails({ ...dsDetails, description })}
          />
        </div>

        <div className="formSection" id="dataset-upload-addtl">
          <PublicationInputList {...createRootListSectionProps("publications", dsDetails, setDsDetails)}/>

          <Fundamentals displayText={displayText.formDisplay.additionalInfo.fundamentals}/>

          <ContactInputList {...createRootListSectionProps("contacts", dsDetails, setDsDetails)}/>
          <LinkedDatasetInputList {...createRootListSectionProps("linkedDatasets", dsDetails, setDsDetails)}/>
        </div>

        <div className="formSection externalIdentifiers">
          <DoiRefInputList {...createSubListSectionProps(
            "externalIdentifiers", "dois", dsDetails, setDsDetails)} />
          <HyperlinkInputList {...createSubListSectionProps(
            "externalIdentifiers", "hyperlinks", dsDetails, setDsDetails)}/>
          <BioprojectIdRefInputList {...createSubListSectionProps(
            "externalIdentifiers", "bioprojectIds", dsDetails, setDsDetails)}/>
        </div>

        {formConfig.dependencies && (
          <div className="formSection formSection--data-set-dependencies">
            <FieldLabel>
              {formConfig.dependencies.label}
            </FieldLabel>
            {formConfig.dependencies.render({
              value: dsDetails.dependencies ?? [],
              onChange: it => setDsDetails({ ...dsDetails, dependencies: it }),
            })}
          </div>
        )}
      </div>

      <CharacteristicsSegment datasetMeta={dsDetails} setter={setDsDetails} studyDesignSegment={}/>

      <button type="submit" className="btn" disabled={submitting}>
        {displayText.formDisplay.uploadButtonLabel}
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
      {formConfig?.renderFormFooterInfo?.(formConfig.uploadMethodConfigs)}
    </form>
  );
}

function validateForm(
  formConfig: UploadFormConfig,
  { requiredInfo: displayText }: DisplayText["formDisplay"],
  formContent: DatasetFormData,
  dataUpload: DataUpload | undefined,
  metaUploads: MetaFileUpload[],
): FormValidation {
  if (formConfig.dependencies != null && !formContent.dependencies) {
    return {
      valid: false,
      errors: [ `Required: ${displayText.dependenciesFieldLabel.toLowerCase()}` ],
    };
  }

  if (dataUpload == null) {
    const typeString = transform(
      formConfig.uploadMethodConfigs
        .map(it => {
          switch (it.kind) {
            case DataUploadType.SingleFile:
            case DataUploadType.MultiFile:
              return displayText.uploadField.fileText.toLowerCase();
            case DataUploadType.URL:
              return displayText.uploadField.urlText.toUpperCase();
            case DataUploadType.Result:
              return displayText.uploadField.resultText.toLowerCase();
            default:
              throw new Error(`illegal state: unrecognized upload method kind '${it["kind"]}'`);
          }
        }),
      it => {
        switch (it.length) {
          // case 0: -- should be impossible to reach this point with an empty
          //            upload method config array
          case 1:
            return it[0];
          case 2:
            return `${it[0]} or ${it[1]}`;
          default:
            return it.slice(0, -1).join(", ") + ", or " + it[it.length-1];
        }
      },
    );


    return {
      valid: false,
      errors: [ `Required: data ${typeString}` ],
    };
  }

  if (dataUpload.kind === DataUploadType.URL && !isValidUrl(dataUpload.url!!)) {
    return {
      valid: false,
      errors: [
        "The provided data URL does not seem valid. A valid URL must start with"
        + " \"http://\" or \"https://\".",
      ],
    };
  }

  return {
    valid: true,
    submission: {
      metadata: formContent as DatasetPostRequest,
      data: dataUpload as DataUpload,
      docs: metaUploads,
    },
  };
}

// https://stackoverflow.com/a/43467144
function isValidUrl(string: string) {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
}
