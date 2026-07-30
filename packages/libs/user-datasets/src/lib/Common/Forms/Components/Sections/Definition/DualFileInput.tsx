import React, { ReactElement } from 'react';
import { DataFileInput } from './DataFileInput';
import { Consumer, JsonPathBuilder } from '../../../../../Utils';
import { DatasetTypeConfig } from '../../../../Configuration';
import { VdiServiceFeatures } from '../../../../../Service';

export interface DualFileInputProps {
  readonly pathBuilder: JsonPathBuilder;
  readonly dataType: DatasetTypeConfig;
  readonly vdiFeatures: VdiServiceFeatures;
  readonly files: readonly File[];
  readonly setFiles: Consumer<readonly File[]>;
  readonly accept?: string;
}

/**
 * Two data file inputs writing into positions 0 and 1 of `files`.
 *
 * The second input stays disabled until the first is filled. That gating is
 * load-bearing, not cosmetic: it guarantees the array is dense, so position
 * keeps meaning role (0 = sense/unstranded, 1 = antisense) for the manifest.
 */
export function DualFileInput(props: DualFileInputProps): ReactElement {
  const senseFieldName = props.pathBuilder.appendToString('dataFile');
  const antisenseFieldName =
    props.pathBuilder.appendToString('antisenseDataFile');

  const setAt = (index: number, files: readonly File[] | null) => {
    const next = [...props.files];

    if (files == null || files.length === 0) next.splice(index);
    else next[index] = files[0];

    props.setFiles(next);
  };

  const hasSense = props.files.length > 0;

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
        setFile={(files) => setAt(0, files)}
        vdiFeatures={props.vdiFeatures}
        accept={props.accept}
        buttonText="Choose sense or unstranded file"
      />
      <div className="column-2"></div>

      <label
        htmlFor={antisenseFieldName}
        style={{
          fontWeight: 'normal',
          color: hasSense ? 'inherit' : '#666',
          opacity: hasSense ? 1 : 0.85,
        }}
      >
        Data file 2
      </label>
      <DataFileInput
        fieldName={antisenseFieldName}
        dataType={props.dataType}
        required={false}
        setFile={(files) => setAt(1, files)}
        vdiFeatures={props.vdiFeatures}
        disabled={!hasSense}
        accept={props.accept}
        buttonText="Choose anti-sense file (optional)"
      />
      <div className="column-2"></div>
    </>
  );
}
