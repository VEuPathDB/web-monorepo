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
import {
  utf8ByteLength,
  SAMPLE_INFO_MAX_BYTES,
} from '../../../../../Service/utils/rnaseq-rc-data-files';

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

  const slots = formConfig.dataInputConfig.file?.enabled
    ? formConfig.dataInputConfig.file.slots
    : undefined;
  const useSlottedInputs = (slots?.length ?? 0) > 1;

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

        {formConfig.verbiage.formInputs?.samplesDescription &&
          props.showDataInputs && (
            <>
              <TextAreaInput
                label={formConfig.verbiage.formInputs.samplesDescription.label}
                fieldName="samplesDescription"
                value={datasetDetails.samplesDescription}
                onChange={(v) =>
                  setMetadata({ ...datasetDetails, samplesDescription: v })
                }
                required={props.showDataInputs}
                rows={15}
                placeholder="Describe your samples here, as a table or as free text (for example, the Methods section of the associated paper or the metadata from supplemental files).

If the sample names in your count file headers already describe the samples (e.g. 'male_3h_rep1'), you don't need to repeat that here - though details such as time-series reference points or treatment specifics are still worth adding. But if those sample names are codes or numbers (e.g. 'S001'), each one must appear somewhere in this description, with its meaning explained.

State the units for any numbers you mention (e.g. 'age: 5 days', not 'age: 5').

*This text is submitted to the VEuPathDB AI Metadata Analyzer*, which uses it to describe your samples so you can compare groups (for example, treated vs. control) in your analysis."
                helpText={
                  typeof formConfig.verbiage.formInputs.samplesDescription
                    .helpText === 'function'
                    ? formConfig.verbiage.formInputs.samplesDescription.helpText()
                    : formConfig.verbiage.formInputs.samplesDescription.helpText
                }
              />

              <div className="column-2" style={{ textAlign: 'right' }}>
                <span
                  style={{
                    fontSize: '0.9em',
                    color:
                      utf8ByteLength(datasetDetails.samplesDescription ?? '') >
                      SAMPLE_INFO_MAX_BYTES
                        ? 'red'
                        : '#666',
                  }}
                >
                  {utf8ByteLength(
                    datasetDetails.samplesDescription ?? ''
                  ).toLocaleString()}{' '}
                  / {SAMPLE_INFO_MAX_BYTES.toLocaleString()} bytes
                </span>
              </div>
            </>
          )}

        {referenceGenome}

        {props.showVisibilities && (
          <VisibilityOptions
            datasetMeta={datasetDetails}
            setDatasetMeta={setMetadata}
            jsonPath={jsonPath}
          />
        )}

        {props.showDataInputs && useSlottedInputs && (
          <>
            <DualFileInput
              pathBuilder={props.contentJsonPath}
              dataType={formConfig.dataType}
              vdiFeatures={formProps.vdiConfig.features}
              slots={slots!}
              files={fileUploads.dataFiles ?? []}
              setFiles={(files) =>
                setUploads({ ...fileUploads, dataFiles: files })
              }
              accept={
                formConfig.dataInputConfig.file?.enabled
                  ? formConfig.dataInputConfig.file.accept
                  : undefined
              }
            />
            {typeof formConfig.dataInputConfig.helpText === 'function' && (
              <div className="column-2">
                {formConfig.dataInputConfig.helpText()}
              </div>
            )}
          </>
        )}

        {props.showDataInputs && !useSlottedInputs && (
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
