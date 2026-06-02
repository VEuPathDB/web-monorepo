import { ReactElement } from 'react';
import { Consumer } from '../../../../../Utils';
import { GlobeIcon } from '../../Components';

export interface DatasetPropertiesInputProps {
  readonly label: string;
  readonly fieldName: string;
  readonly required?: boolean;
  readonly allowMultiple?: boolean;
  readonly allowedExtensions?: readonly string[];
  readonly setFiles: Consumer<FileList | null>;
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
        <GlobeIcon /> {props.label}
      </label>
      <input
        type="file"
        accept={props.allowedExtensions?.join(',')}
        id={props.fieldName}
        name={props.fieldName}
        required={props.required === true}
        multiple={props.allowMultiple === true}
        onChange={(e) => props.setFiles(e.target.files)}
      />
      {helpText}
    </>
  );
}
