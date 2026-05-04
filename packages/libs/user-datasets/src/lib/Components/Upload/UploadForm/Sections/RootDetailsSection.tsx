import { ReactElement } from 'react';

import { RootDataInput } from "../Components/RootDataInput";
import { InputPair, UploadButton } from '../Components';
import { Consumer, JsonPathBuilder } from '../../../../Utils';
import { UploadFormProps } from "../UploadForm";
import { DatasetPostDetails } from "../../../../Service";
import { DatasetUploads } from "../../../../Service/model/utility-types";

export interface RootDetailsSectionProps {
  readonly formProps: UploadFormProps;

  readonly onSubmit: () => void;

  /**
   * Dataset metadata definition.
   */
  readonly datasetMeta: DatasetPostDetails;
  readonly setDatasetMeta: Consumer<DatasetPostDetails>;

  readonly uploads: DatasetUploads;
  readonly setUploads: Consumer<DatasetUploads>;

  /**
   * JSON Path Builder instance for dataset details/metadata field paths.
   */
  readonly detailsJsonPath: JsonPathBuilder;

  /**
   * JSON Path Builder instance for dataset file upload paths.
   */
  readonly contentJsonPath: JsonPathBuilder;
}

export function RootDetailsSection(props: RootDetailsSectionProps): ReactElement {
  const {
    datasetMeta: metadata,
    detailsJsonPath: jsonPath,
    setDatasetMeta: setMetadata,
  } = props;

  const nameKey = jsonPath.appendToString<DatasetPostDetails>('name');
  const summaryKey = jsonPath.appendToString<DatasetPostDetails>('summary');

  return <section>
    <div className="field-grid">
      <InputPair
        label="Name"
        fieldName={nameKey}
        onChange={v => setMetadata({ ...metadata, name: v })}
        labelClass="required"
      />

      <InputPair
        label="Summary"
        fieldName={summaryKey}
        onChange={v => setMetadata({ ...metadata, summary: v })}
        labelClass="required"
      />

      <RootDataInput
        pathBuilder={props.contentJsonPath}
        dataType={props.formProps.dataType}
        vdiConfig={props.formProps.vdiConfig}
        {...props.formProps.uploadConfig}
      />

      {props.formProps.helpText?.()}
    </div>

    {props.formProps.verbiage.afterUploadHelpText}

    <UploadButton onClick={props.onSubmit} />
  </section>;
}
