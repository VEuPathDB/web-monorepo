import React, { ReactElement } from 'react';
import { PartialDatasetDetails } from '../../../../../Service';
import { JsonPathBuilder } from '../../../../../Utils';
import { DatasetVisibility } from '../../../../../Service/Model';
import { LabelInputPair } from '../../LabelInputPair';
import { useDatasetVisibility } from '../../../Hooks/dataset-metadata-hooks';
import { useDispatch } from 'react-redux';
import { overwriteMetaField } from '../../../../../Actions/DatasetMetadataFormActions';

export interface VisibilityOptionProps {
  readonly jsonPath: JsonPathBuilder;
}

export function VisibilityOptions(props: VisibilityOptionProps): ReactElement {
  const visibility = useDatasetVisibility();
  const dispatch = useDispatch();

  const setVisibility = (v: DatasetVisibility) =>
    dispatch(overwriteMetaField('visibility', v));

  const fieldName =
    props.jsonPath.appendToString<PartialDatasetDetails>('visibility');

  return (
    <>
      <span className="multi-input-label">Visibility</span>
      <div className="field-grid narrow-labels">
        <LabelInputPair
          type="radio"
          label="Public"
          labelClass="left"
          inputClass="right"
          fieldName={fieldName}
          checked={isPublic(visibility)}
          value="public"
          onChange={(e) => {
            if (isPublic(e.target.value)) setVisibility('public');
          }}
          flipped={true}
          helpText={
            'No access restrictions; anyone can view this dataset or download' +
            ' its data.'
          }
        />
        <LabelInputPair
          type="radio"
          label="Private"
          labelClass="left"
          inputClass="right"
          idOverride={`${fieldName}.private`}
          fieldName={fieldName}
          checked={!isPublic(visibility)}
          value="private"
          onChange={(e) => {
            if (!isPublic(e.target.value)) setVisibility('private');
          }}
          flipped={true}
          helpText={
            'This dataset can only be viewed or downloaded by its uploader or' +
            ' users it has been explicitly shared with.'
          }
        />
      </div>
    </>
  );
}

/**
 * In VDI the visibility value is an enum with more options than 'private' and
 * 'public', however for the update form we are considering anything that isn't
 * 'public' to have the same rules as if the dataset was 'private'.
 */
function isPublic(value: string | undefined): boolean {
  return value === 'public';
}
