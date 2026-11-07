import React from 'react';
import lodash from 'lodash';
import * as util from '../../../../../Utils';
import { UploadContent } from '../../../../../Service/Model';
import { LabelInputPair } from '../../LabelInputPair';

export interface DatasetPropertiesInputProps {
  readonly label: string;
  readonly fieldName: string;
  readonly required?: boolean;
  readonly allowMultiple?: boolean;
  readonly allowedExtensions?: ReadonlyArray<string>;

  readonly files: util.Possible<ReadonlyArray<UploadContent>>;
  readonly setFiles: util.Consumer<util.Possible<ReadonlyArray<UploadContent>>>;

  readonly helpText?: () => React.ReactElement;
}

export function DatasetPropertiesInput(
  props: DatasetPropertiesInputProps
): React.ReactElement {
  let buttonText = lodash.isEmpty(props.files)
    ? 'Choose File'
    : 'Change File';

  if (props.allowMultiple)
    buttonText += '(s)';

  return (
    <LabelInputPair
      type="file"
      label={props.label}
      buttonText={buttonText}
      fieldName={props.fieldName}
      multiple={props.allowMultiple === true}
      required={props.required === true}
      accept={props.allowedExtensions?.join(',')}
      value={props.files}
      onChange={props.setFiles}
      helpText={props.helpText?.()}
    />
  );
}
