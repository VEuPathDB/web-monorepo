import React, { ReactElement, useCallback } from 'react';

import {
  OptionalFileUploadProps,
  OptionalUrlUploadProps,
  RootDataInput,
} from './RootDataInput';
import { DatasetPropertiesInput } from './DatasetPropertiesInput';
import { InputPair, UploadButton } from '../../index';
import { TextAreaInput } from '../../TextAreaInput';
import { Consumer, JsonPathBuilder } from '../../../../../Utils';
import { PartialDatasetDetails, DatasetUploads } from '../../../../../Service';
import { isEmpty } from 'lodash';
import { useDispatch } from 'react-redux';
import { useDatasetFormState } from '../../../../../StoreModules/UserDatasetUploadStoreModule';
import { updateFormState } from '../../../../../Actions/UserDatasetUploadActions';
import { SubmittableState } from '../../UploadButton';
import { DatasetDependencies } from './DatasetDependencies';
import { DatasetFormProps } from '../../../DatasetFormProps';
import { VisibilityOptions } from './VisibilityOptions';
import { DualFileInput } from './DualFileInput';

export interface RootDetailsSectionProps {
  readonly formProps: DatasetFormProps;

  readonly onSubmit: () => void;

  /**
   * JSON Path Builder instance for dataset details/metadata field paths.
   */
  readonly detailsJsonPath: JsonPathBuilder;

  /**
   * JSON Path Builder instance for dataset file upload paths.
   */
  readonly contentJsonPath: JsonPathBuilder;

  /**
   * Whether the form submit button should be disabled.
   */
  readonly submittable?: SubmittableState;

  /**
   * Whether the dataset visibility inputs should be rendered.
   */
  readonly showVisibilities: boolean;

  /**
   * Whether the data upload file input(s) should be rendered.
   */
  readonly showDataInputs: boolean;

  /**
   * Optional label override for the upload button.
   */
  readonly uploadButtonText?: string;

  readonly requireDatasetPropertiesFile?: boolean;
}

export function RootDetailsSection(
  props: RootDetailsSectionProps
): ReactElement {
  const {
    detailsJsonPath: jsonPath,
    formProps: { formConfig, ...formProps },
  } = props;

  const dispatch = useDispatch();
  const { datasetDetails, fileUploads, formMetaState } = useDatasetFormState();

  const nameKey = jsonPath.appendToString<PartialDatasetDetails>('name');
  const summaryKey = jsonPath.appendToString<PartialDatasetDetails>('summary');

  const setMetadata = useCallback(
    (datasetDetails: PartialDatasetDetails) =>
      dispatch(updateFormState({ datasetDetails, fileUploads, formMetaState })),
    [dispatch, fileUploads, formMetaState]
  );

  const setUploads = useCallback(
    (fileUploads: DatasetUploads) =>
      dispatch(updateFormState({ datasetDetails, fileUploads, formMetaState })),
    [dispatch, datasetDetails, formMetaState]
  );

  const fileUpload = buildFileProps(props.formProps, fileUploads, setUploads);
  const urlUpload = buildUrlProps(props.formProps, fileUploads, setUploads);

  const referenceGenome = formConfig.dependencies ? (
    <DatasetDependencies
      config={formConfig.dependencies}
      datasetDetails={datasetDetails}
      setDatasetDetails={setMetadata}
    />
  ) : null;

  // Check if this is rnaseq-rc type (has samplesDescription field)
  const isRnaSeqRc = !!formConfig.verbiage.formInputs?.samplesDescription;

  return (
    <section id="define-dataset">
      <h3>Define Dataset</h3>

      <div className="field-grid">
        <InputPair
          label="Dataset Name"
          fieldName={nameKey}
          value={datasetDetails.name}
          onChange={(v) => setMetadata({ ...datasetDetails, name: v })}
          minLength={3}
          maxLength={1024}
          required={true}
        />

        <InputPair
          label="Summary"
          fieldName={summaryKey}
          value={datasetDetails.summary}
          onChange={(v) => setMetadata({ ...datasetDetails, summary: v })}
          minLength={3}
          maxLength={4000}
          required={true}
        />

        {formConfig.verbiage.formInputs?.samplesDescription && (
          <TextAreaInput
            label={formConfig.verbiage.formInputs.samplesDescription.label}
            fieldName="samplesDescription"
            value={datasetDetails.samplesDescription}
            onChange={(v) =>
              setMetadata({ ...datasetDetails, samplesDescription: v })
            }
            required={true}
            rows={15}
            placeholder="Paste here a detailed description of the samples used in this dataset, for example the Methods section of the associated paper.

This text will be submitted to the VEuPathDB AI Metadata Analyzer. The output will be carefully named and annotated samples, making the dataset as useful as possible in the website.

IMPORTANT: If the sample names alone do not make the experimental design clear, please also explain what abbreviations mean, which samples are replicates, and what conditions or timepoints are represented."
            helpText={
              typeof formConfig.verbiage.formInputs.samplesDescription
                .helpText === 'function'
                ? formConfig.verbiage.formInputs.samplesDescription.helpText()
                : formConfig.verbiage.formInputs.samplesDescription.helpText
            }
          />
        )}

        {referenceGenome}

        {props.showVisibilities && (
          <VisibilityOptions
            datasetMeta={datasetDetails}
            setDatasetMeta={setMetadata}
            jsonPath={jsonPath}
          />
        )}

        {props.showDataInputs && isRnaSeqRc && (
          <DualFileInput
            pathBuilder={props.contentJsonPath}
            dataType={formConfig.dataType}
            vdiFeatures={formProps.vdiConfig.features}
            files={fileUploads.dataFiles ?? []}
            setFiles={(files) =>
              setUploads({ ...fileUploads, dataFiles: files })
            }
            accept=".tsv,.tab,.txt"
          />
        )}

        {props.showDataInputs && !isRnaSeqRc && (
          <RootDataInput
            pathBuilder={props.contentJsonPath}
            dataType={formConfig.dataType}
            vdiConfig={formProps.vdiConfig}
            fileUpload={fileUpload}
            urlUpload={urlUpload}
            helpText={formConfig.dataInputConfig.helpText}
          />
        )}

        {formConfig.dataType.vdiConfig.usesDataProperties &&
          formConfig.verbiage.formInputs?.datasetProperties && (
            <DatasetPropertiesInput
              label={formConfig.verbiage.formInputs.datasetProperties.label}
              fieldName="dataPropertiesFile"
              allowedExtensions={['.txt', '.csv', '.tsv']}
              setFiles={(files) =>
                setUploads({
                  ...fileUploads,
                  dataPropertiesFiles: files ?? undefined,
                })
              }
              required={props.requireDatasetPropertiesFile}
              helpText={
                formConfig.verbiage.formInputs.datasetProperties.helpText
              }
            />
          )}
      </div>

      {formConfig.verbiage.afterUploadHelpText}

      <UploadButton
        onClick={props.onSubmit}
        submittable={props.submittable}
        buttonText={props.uploadButtonText}
      />
    </section>
  );
}

function buildFileProps(
  { formConfig: { dataInputConfig }, vdiConfig }: DatasetFormProps,
  uploads: DatasetUploads,
  setUploads: Consumer<DatasetUploads>
): OptionalFileUploadProps {
  if (dataInputConfig.file?.enabled !== true) return { enabled: false };

  return {
    ...dataInputConfig.file,
    vdiConfig,
    // TODO: add support multiple data files in a single upload.
    files: isEmpty(uploads.dataFiles) ? null : uploads.dataFiles!,
    setFiles: (value) =>
      setUploads({
        ...uploads,
        dataFiles: value ?? undefined,
      }),
  };
}

function buildUrlProps(
  {
    formConfig: {
      dataInputConfig: { url },
    },
  }: DatasetFormProps,
  uploads: DatasetUploads,
  setUploads: Consumer<DatasetUploads>
): OptionalUrlUploadProps {
  if (url?.enabled !== true) return { enabled: false };

  return {
    ...url,
    url: uploads.url ?? '',
    setUrl: (url) =>
      isEmpty(url)
        ? setUploads({ ...uploads, url: undefined })
        : setUploads({ ...uploads, url }),
  };
}
