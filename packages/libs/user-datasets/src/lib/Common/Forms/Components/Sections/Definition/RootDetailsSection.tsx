import React from 'react';
import * as util from '../../../../../Utils';

import { FileUploadProps, RootDataInput, UrlUploadProps } from './RootDataInput';
import { DatasetPropertiesInput } from './DatasetPropertiesInput';
import { LabelInputPair, UploadButton } from '../../index';
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
import { FIELD_NAME_DATA_PROP_FILE } from '../../../form-constants';

export interface RootDetailsSectionProps {
  readonly formProps: DatasetFormProps;

  readonly onSubmit: () => void;

  /**
   * JSON Path Builder instance for dataset details/metadata field paths.
   */
  readonly detailsJsonPath: util.JsonPathBuilder;

  /**
   * JSON Path Builder instance for dataset file upload paths.
   */
  readonly contentJsonPath: util.JsonPathBuilder;

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
): React.ReactElement {
  const {
    detailsJsonPath: jsonPath,
    formProps: { formConfig, ...formProps },
  } = props;

  const dispatch = useDispatch();
  const formState = useDatasetFormState();
  const { datasetDetails } = formState;

  const nameKey = jsonPath.appendToString<PartialDatasetDetails>('name');
  const summaryKey = jsonPath.appendToString<PartialDatasetDetails>('summary');

  const setMetadata = React.useCallback(
    (datasetDetails: PartialDatasetDetails) =>
      dispatch(updateFormState({ ...formState, datasetDetails })),
    [dispatch, formState]
  );

  const setDataUploads = React.useCallback(
    (fileUploads: UploadContentMap) =>
      dispatch(updateFormState({ ...formState, dataFileSelections: fileUploads })),
    [dispatch, formState]
  );

  const showDataPropsInput = formConfig.dataType.vdiConfig.usesDataProperties &&
    formConfig.verbiage.formInputs?.datasetProperties;

  const setAnnotationUploads = React.useCallback(
    (fileUploads: UploadContentMap) =>
      dispatch(updateFormState({ ...formState, dataPropertiesFileSelections: fileUploads })),
    [dispatch, formState]
  );

  const dataPropsFieldName = showDataPropsInput
    ? FIELD_NAME_DATA_PROP_FILE.toString()
    : undefined;

  const setUrlUpload = React.useCallback(
    (url: util.Possible<string>) => dispatch({ ...formState, dataFileUrl: url }),
    [dispatch, formState],
  );

  const fileUpload = useFileProps(
    props.formProps,
    props.contentJsonPath,
    formState,
    setDataUploads,
  );

  const urlUpload = useUrlProps(props.formProps, props.contentJsonPath, formState.dataFileUrl, setUrlUpload);

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
        <LabelInputPair
          label="Dataset Name"
          fieldName={nameKey}
          value={datasetDetails.name}
          onChange={(v) => setMetadata({ ...datasetDetails, name: v })}
          minLength={3}
          maxLength={1024}
          required={true}
        />

        <LabelInputPair
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
              fieldName={dataPropsFieldName!}
              allowedExtensions={['.txt', '.csv', '.tsv']}
              files={formState.dataPropertiesFileSelections[dataPropsFieldName!]}
              setFiles={files => setAnnotationUploads({
                ...formState.dataPropertiesFileSelections,
                [dataPropsFieldName!]: files ?? [],
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

function useFileProps(
  { formConfig: { dataInputConfig, dataType }, vdiConfig }: DatasetFormProps,
  jsonPath: util.JsonPathBuilder,
  { dataFileSelections }: DatasetFormState,
  setUploads: util.Consumer<UploadContentMap>
): util.Possible<FileUploadProps> {
  return React.useMemo(
    () => dataInputConfig.byFile == null
      ? undefined
      : ({
        ...dataInputConfig.byFile,
        vdiConfig,
        dataType,
        setFiles: dataFiles => setUploads({ ...dataFileSelections, ...(dataFiles ?? {}) }),
        pathBuilder: jsonPath,
        files: isEmpty(dataFileSelections) ? undefined : dataFileSelections!,
      }),

    // Suppress linting: dataInputConfig, dataType, vdiConfig, and jsonPath are
    // static in value regardless of instance equality.
    //
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dataFileSelections, setUploads],
  );
}

function useUrlProps(
  {
    formConfig: {
      dataInputConfig: { byUrl, byFile },
      dataType,
    },
  }: DatasetFormProps,
  jsonPath: util.JsonPathBuilder,
  dataFileUrl: util.Possible<string>,
  setUrl: util.Consumer<util.Possible<string>>
): util.Possible<UrlUploadProps> {
  return React.useMemo(
    () => byUrl == null
      ? undefined
      : ({
        ...byUrl,
        dataType,
        pathBuilder: jsonPath,
        url: dataFileUrl ?? '',
        required: byFile == null,
        setUrl: url => isEmpty(url) ? setUrl(undefined) : setUrl(url),
      }),

    // Suppress linting: byUrl, byFile, dataType, and jsonPath are static in
    // value regardless of instance equality.
    //
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dataFileUrl, setUrl],
  );
}
