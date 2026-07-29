import React, { ReactElement } from 'react';
import { DataFileInput } from './DataFileInput';
import { Consumer, JsonPathBuilder, Nullable } from '../../../../../Utils';
import { DatasetTypeConfig } from '../../../../Configuration';
import { VdiServiceFeatures } from '../../../../../Service';

export interface DualFileInputProps {
  readonly pathBuilder: JsonPathBuilder;
  readonly dataType: DatasetTypeConfig;
  readonly vdiFeatures: VdiServiceFeatures;
  readonly senseFile: Nullable<FileList>;
  readonly antisenseFile: Nullable<FileList>;
  readonly setSenseFile: Consumer<Nullable<FileList>>;
  readonly setAntisenseFile: Consumer<Nullable<FileList>>;
  readonly accept?: string;
}

/**
 * Component for uploading two files: a primary (sense/unstranded) file and an optional antisense file.
 */
export function DualFileInput(props: DualFileInputProps): ReactElement {
  const senseFieldName = props.pathBuilder.appendToString('dataFile');
  const antisenseFieldName =
    props.pathBuilder.appendToString('antisenseDataFile');

  return (
    <>
      <label
        htmlFor={senseFieldName}
        style={{ fontWeight: 'normal', color: 'red' }}
      >
        Data file 1 <span>*</span>
      </label>
      <DataFileInput
        fieldName={senseFieldName}
        dataType={props.dataType}
        required={true}
        setFile={props.setSenseFile}
        vdiFeatures={props.vdiFeatures}
        accept={props.accept}
        buttonText="Choose sense or unstranded file"
      />
      <div className="column-2"></div>

      <label
        htmlFor={antisenseFieldName}
        style={{
          fontWeight: 'normal',
          color: props.senseFile ? 'inherit' : '#666',
          opacity: props.senseFile ? 1 : 0.85,
        }}
      >
        Data file 2
      </label>
      <DataFileInput
        fieldName={antisenseFieldName}
        dataType={props.dataType}
        required={false}
        setFile={props.setAntisenseFile}
        vdiFeatures={props.vdiFeatures}
        disabled={!props.senseFile}
        accept={props.accept}
        buttonText="Choose anti-sense file (optional)"
      />
      <div className="column-2"></div>
    </>
  );
}
