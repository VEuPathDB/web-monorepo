import React, { ReactElement, useCallback } from 'react';

import {
  OptionalFileUploadProps,
  OptionalUrlUploadProps,
  RootDataInput,
} from './RootDataInput';
import { DatasetPropertiesInput } from './DatasetPropertiesInput';
import { InputPair, UploadButton } from '../../index';
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
}

export function RootDetailsSection(
  props: RootDetailsSectionProps
): ReactElement {
  const { detailsJsonPath: jsonPath, formProps: { formConfig, ...formProps } } = props;

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

  const referenceGenome = formConfig.dependencies
    ?  <DatasetDependencies
      config={formConfig.dependencies}
      datasetDetails={datasetDetails}
      setDatasetDetails={setMetadata} />
    : null;

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

        {referenceGenome}

        {props.showVisibilities && (
          <VisibilityOptions
            datasetMeta={datasetDetails}
            setDatasetMeta={setMetadata}
            jsonPath={jsonPath} />
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
    file: isEmpty(uploads.dataFiles) ? undefined : uploads.dataFiles![0],
    setFile: (value) =>
      setUploads({
        ...uploads,
        dataFiles: value ? [value] : [],
      }),
  };
}

function buildUrlProps(
  { formConfig: { dataInputConfig: { url } } }: DatasetFormProps,
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
