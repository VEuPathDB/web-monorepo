import React, { ReactElement, useCallback } from 'react';

import { FileUploadProps, RootDataInput, UrlUploadProps } from './RootDataInput';
import { DatasetPropertiesInput } from './DatasetPropertiesInput';
import { InputPair, UploadButton } from '../../index';
import { Consumer, JsonPathBuilder, Possible } from '../../../../../Utils';
import { PartialDatasetDetails } from '../../../../../Service';
import { isEmpty } from 'lodash';
import { useDispatch } from 'react-redux';
import { DatasetFormState, useDatasetFormState } from '../../../../../StoreModules/UserDatasetUploadStoreModule';
import { updateFormState } from '../../../../../Actions/UserDatasetUploadActions';
import { SubmittableState } from '../../UploadButton';
import { DatasetDependencies } from './DatasetDependencies';
import { DatasetFormProps } from '../../../DatasetFormProps';
import { VisibilityOptions } from './VisibilityOptions';
import { UploadContentMap } from '../../../../../Service/Model/utility-types';
import { SamplesDescriptionInput } from './SamplesDescriptionInput';

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
  const formState = useDatasetFormState();
  const { datasetDetails } = formState;

  const nameKey = jsonPath.appendToString<PartialDatasetDetails>('name');
  const summaryKey = jsonPath.appendToString<PartialDatasetDetails>('summary');

  const setMetadata = useCallback(
    (datasetDetails: PartialDatasetDetails) =>
      dispatch(updateFormState({ ...formState, datasetDetails })),
    [dispatch, formState]
  );

  const setDataUploads = useCallback(
    (fileUploads: UploadContentMap) =>
      dispatch(updateFormState({ ...formState, dataFileSelections: fileUploads })),
    [dispatch, formState]
  );

  const showDataPropsInput = formConfig.dataType.vdiConfig.usesDataProperties &&
    formConfig.verbiage.formInputs?.datasetProperties;

  const setDocUploads = useCallback(
    (fileUploads: UploadContentMap) =>
      dispatch(updateFormState({ ...formState, documentFileSelections: fileUploads })),
    [dispatch, formState]
  );

  const docFieldName = showDataPropsInput
    ? props.contentJsonPath.appendToString('dataPropertiesFile')
    : undefined;

  const setUrlUpload = useCallback(
    (url: Possible<string>) => dispatch({ ...formState, dataFileUrl: url }),
    [dispatch, formState],
  );

  const fileUpload = buildFileProps(
    props.formProps,
    props.contentJsonPath,
    formState,
    setDataUploads,
  );

  const urlUpload = buildUrlProps(props.formProps, props.contentJsonPath, formState.dataFileUrl, setUrlUpload);

  const referenceGenome = formConfig.dependencies ? (
    <DatasetDependencies
      config={formConfig.dependencies}
      datasetDetails={datasetDetails}
      setDatasetDetails={setMetadata}
    />
  ) : null;

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
            <SamplesDescriptionInput
              formProps={props}
              formConfig={formConfig}
              dataUploads={formState.dataFileSelections}
              setDataUploads={setDataUploads}
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

        {props.showDataInputs && (
          <RootDataInput
            pathBuilder={props.contentJsonPath}
            dataType={formConfig.dataType}
            vdiConfig={formProps.vdiConfig}
            fileUpload={fileUpload}
            urlUpload={urlUpload}
            helpText={formConfig.dataInputConfig.helpText}
          />
        )}

        {showDataPropsInput && (
            <DatasetPropertiesInput
              label={formConfig.verbiage.formInputs.datasetProperties.label}
              fieldName={docFieldName!}
              allowedExtensions={['.txt', '.csv', '.tsv']}
              files={formState.documentFileSelections[docFieldName!]}
              setFiles={files => setDocUploads({
                ...formState.documentFileSelections,
                [docFieldName!]: files ?? [],
              })}
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
  { formConfig: { dataInputConfig, dataType }, vdiConfig }: DatasetFormProps,
  jsonPath: JsonPathBuilder,
  formState: DatasetFormState,
  setUploads: Consumer<UploadContentMap>
): Possible<FileUploadProps> {
  if (dataInputConfig.byFile == null)
    return undefined;

  return {
    ...dataInputConfig.byFile ?? {},
    vdiConfig,
    dataType,
    pathBuilder: jsonPath,
    files: isEmpty(formState.dataFileSelections) ? undefined : formState.dataFileSelections!,
    setFiles: (dataFiles) => setUploads({ ...formState.dataFileSelections, ...(dataFiles ?? {}) }),
  };
}

function buildUrlProps(
  {
    formConfig: {
      dataInputConfig: { byUrl, byFile },
      dataType,
    },
  }: DatasetFormProps,
  jsonPath: JsonPathBuilder,
  dataFileUrl: Possible<string>,
  setUploads: Consumer<Possible<string>>
): Possible<UrlUploadProps> {
  if (byUrl == null)
    return undefined;

  return {
    ...byUrl,
    dataType,
    pathBuilder: jsonPath,
    url: dataFileUrl ?? '',
    required: byFile == null,
    setUrl: (url) => isEmpty(url) ? setUploads(undefined) : setUploads(url),
  };
}
