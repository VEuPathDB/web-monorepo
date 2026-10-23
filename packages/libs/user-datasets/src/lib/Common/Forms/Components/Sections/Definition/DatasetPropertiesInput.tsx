import React, { ReactElement } from 'react';
import { Consumer, ifDefined, Nullable, Possible } from '../../../../../Utils';
import { newUploadContent, UploadContent } from '../../../../../Service/Model';
import { filterNullish } from '../../../../../Utils/miscellaneous-junk';

export interface DatasetPropertiesInputProps {
  readonly label: string;
  readonly fieldName: string;
  readonly required?: boolean;
  readonly allowMultiple?: boolean;
  readonly allowedExtensions?: readonly string[];

  readonly files: Possible<ReadonlyArray<UploadContent>>;
  readonly setFiles: Consumer<Possible<ReadonlyArray<UploadContent>>>;

  readonly helpText?: () => ReactElement;
}

export function DatasetPropertiesInput(
  props: DatasetPropertiesInputProps
): ReactElement {
  const helpText =
    typeof props.helpText === 'function' ? (
      <div className="column-2">{props.helpText()}</div>
    ) : undefined;

  const labelClass = props.required ? 'required' : undefined;

  return (
    <>
      <label htmlFor={props.fieldName} className={labelClass}>
        {props.label}
      </label>
      <input
        type="file"
        accept={props.allowedExtensions?.join(',')}
        id={props.fieldName}
        name={props.fieldName}
        required={props.required === true}
        multiple={props.allowMultiple === true}
        onChange={(e) => props.setFiles(ifDefined(
          e.target.files ?? undefined,
          (it) => filterNullish(Array.from<Nullable<File>>(it))
            .map(file => newUploadContent(file))
        ))}
      />
      {helpText}
    </>
  );
}
