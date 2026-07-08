import React, { ReactElement } from 'react';
import { PartialDatasetDetails } from '../../../../../Service';
import { changeHandler, Consumer, JsonPathBuilder } from '../../../../../Utils';
import { FieldHelpText, InputBlock } from '../../index';

export interface DatasetInformationSectionProps {
  readonly datasetMeta: PartialDatasetDetails;
  readonly setDatasetMeta: Consumer<PartialDatasetDetails>;
  readonly jsonPath: JsonPathBuilder;
}

export function DatasetInformationSection(
  props: DatasetInformationSectionProps
): ReactElement {
  const fieldName =
    props.jsonPath.appendToString<PartialDatasetDetails>('description');

  return (
    <InputBlock header="Dataset Information">
      <div className="field-grid">
        <label htmlFor={fieldName}>Description</label>
        <textarea
          name={fieldName}
          id={fieldName}
          value={props.datasetMeta.description}
          onChange={(e) =>
            changeHandler(
              'description',
              props.datasetMeta,
              props.setDatasetMeta
            )(e.currentTarget.value)
          }
        />
        <FieldHelpText>
          Longform description of the dataset including background, objectives,
          methodology, etc...
        </FieldHelpText>
      </div>
    </InputBlock>
  );
}
