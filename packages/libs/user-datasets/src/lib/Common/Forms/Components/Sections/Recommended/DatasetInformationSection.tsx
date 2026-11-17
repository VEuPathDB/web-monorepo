import React from 'react';
import * as vdi from '../../../../../Service/Model';

import { JsonPathBuilder } from '../../../../../Utils';
import { InputBlock, LabelInputPair } from '../../index';
import { useDatasetMetadata } from '../../../Hooks/dataset-metadata-hooks';
import { useDispatch } from 'react-redux';
import { overwriteMetaField } from '../../../../../Actions/DatasetMetadataFormActions';

export interface DatasetInformationSectionProps {
  readonly jsonPath: JsonPathBuilder;
}

export function DatasetInformationSection(props: DatasetInformationSectionProps): React.ReactElement {
  const { description } = useDatasetMetadata() ?? {};
  const dispatch = useDispatch();

  const setDescription = React.useCallback(
    (it: string) => dispatch(overwriteMetaField('description', it)),
    [dispatch],
  );

  return (
    <InputBlock header="Dataset Information">
      <div className="field-grid">
        <LabelInputPair
          type="text"
          label="Description"
          fieldName={props.jsonPath.appendToString<vdi.PartialDatasetDetails>('description')}
          value={description}
          onChange={setDescription}
          helpText={
            'Longform description of the dataset including background, objectives, methodology, etc...'
          }
        />
      </div>
    </InputBlock>
  );
}
