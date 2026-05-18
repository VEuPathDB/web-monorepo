import { ReactElement, ReactNode, useState } from 'react';
import { Consumer } from '../../../../Utils';
import { FieldHelpText } from './FieldHelpText';

export interface YesNoToggleProps {
  readonly value: boolean | undefined;
  readonly setValue: Consumer<boolean>;
  readonly fieldName: string;
  readonly helpText?: ReactNode;
  readonly className?: string;
}

export function YesNoToggle(props: YesNoToggleProps): ReactElement {
  const [current, setCurrent] = useState(props.value);

  const yesId = props.fieldName + '-yes';
  const noId = props.fieldName + '-no';

  const helpText = props.helpText ? (
    <FieldHelpText>{props.helpText}</FieldHelpText>
  ) : undefined;

  const className = 'section-toggle' + (props.className
    ? ' ' + props.className
   : '');

  return (
    <>
      <p className={className}>
        <input
          id={yesId}
          type="radio"
          value="1"
          checked={current === true}
          name={props.fieldName}
          required={true}
          onChange={(e) => {
            setCurrent(e.currentTarget.checked);
            props.setValue(e.currentTarget.checked);
          }}
        />
        &nbsp;
        <label htmlFor={yesId}>Yes</label>
        <input
          id={noId}
          type="radio"
          value="1"
          checked={current === false}
          name={props.fieldName}
          required={true}
          onChange={(e) => {
            setCurrent(!e.currentTarget.checked);
            props.setValue(!e.currentTarget.checked);
          }}
        />
        &nbsp;
        <label htmlFor={noId}>No</label>
      </p>
      {helpText}
    </>
  );
}
