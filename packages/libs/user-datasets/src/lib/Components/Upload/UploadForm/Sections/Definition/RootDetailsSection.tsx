import { ReactElement, useCallback } from 'react';

import {
  OptionalFileUploadProps,
  OptionalUrlUploadProps,
  RootDataInput,
} from './RootDataInput';
import { DatasetPropertiesInput } from './DatasetPropertiesInput';
import { GlobeIcon, InputPair, UploadButton } from '../../Components';
import { Consumer, JsonPathBuilder } from '../../../../../Utils';
import { UploadFormProps } from '../../UploadForm';
import { DatasetPostDetails, DatasetUploads } from '../../../../../Service';
import { isEmpty } from 'lodash';
import { useDispatch } from 'react-redux';
import { useUploadFormState } from '../../../../../StoreModules/UserDatasetUploadStoreModule';
import { updateFormState } from '../../../../../Actions/UserDatasetUploadActions';
import { SubmittableState } from '../../Components/UploadButton';
import { DatasetDependencies } from './DatasetDependencies';

export interface RootDetailsSectionProps {
  readonly formProps: UploadFormProps;
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
}

export function RootDetailsSection(
  props: RootDetailsSectionProps
): ReactElement {
  const { detailsJsonPath: jsonPath, formProps } = props;

  const dispatch = useDispatch();
  const { datasetDetails, fileUploads, formMetaState } = useUploadFormState();

  const nameKey = jsonPath.appendToString<DatasetPostDetails>('name');
  const summaryKey = jsonPath.appendToString<DatasetPostDetails>('summary');

  const setMetadata = useCallback(
    (datasetDetails: DatasetPostDetails) =>
      dispatch(updateFormState({ datasetDetails, fileUploads, formMetaState })),
    [dispatch, fileUploads, formMetaState]
  );

  const setUploads = useCallback(
    (fileUploads: DatasetUploads) =>
      dispatch(updateFormState({ datasetDetails, fileUploads, formMetaState })),
    [dispatch, datasetDetails, formMetaState]
  );

  const fileUpload = buildFileProps(formProps, fileUploads, setUploads);
  const urlUpload = buildUrlProps(formProps, fileUploads, setUploads);

  const referenceGenome = formProps.dependencies
    ?  <DatasetDependencies
      config={formProps.dependencies}
      datasetDetails={datasetDetails}
      setDatasetDetails={setMetadata} />
    : null;

  return (
    <section>
      <h3>
        <GlobeIcon /> Define Dataset:
      </h3>

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

        <RootDataInput
          pathBuilder={props.contentJsonPath}
          dataType={formProps.dataType}
          vdiConfig={formProps.vdiConfig}
          fileUpload={fileUpload}
          urlUpload={urlUpload}
          urlParams={formProps.urlParams}
          helpText={formProps.dataInputConfig.helpText}
        />

        {formProps.dataType.vdiConfig.usesDataProperties &&
          formProps.verbiage.formInputs?.datasetProperties && (
            <DatasetPropertiesInput
              label={formProps.verbiage.formInputs.datasetProperties.label}
              fieldName="dataPropertiesFile"
              allowedExtensions={['.txt', '.csv', '.tsv']}
              setFiles={(files) =>
                setUploads({
                  ...fileUploads,
                  dataPropertiesFiles: files ?? undefined,
                })
              }
              helpText={
                formProps.verbiage.formInputs.datasetProperties.helpText
              }
            />
          )}
      </div>

      {props.formProps.verbiage.afterUploadHelpText}

      <UploadButton onClick={props.onSubmit} submittable={props.submittable} />
    </section>
  );
}

function buildFileProps(
  { dataInputConfig, vdiConfig }: UploadFormProps,
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
  { dataInputConfig: { url } }: UploadFormProps,
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
