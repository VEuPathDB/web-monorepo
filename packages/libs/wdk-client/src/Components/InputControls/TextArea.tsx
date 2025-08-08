/**
 * Provides a simple wrapper around <textarea/>.  The only difference
 * is that the value passed to the onChange property is the new value inside the
 * textbox, not the event causing the change.
 */

import React, { TextareaHTMLAttributes } from 'react';

import { Omit } from '../../Core/CommonTypes';
import { wrappable } from '../../Utils/ComponentUtils';

import './TextArea.scss';

type InputProps = TextareaHTMLAttributes<HTMLTextAreaElement>;
type InputPropsWithoutOnChange = Omit<InputProps, 'onChange'>;
type Props = InputPropsWithoutOnChange & {
  onChange: (value: string) => void;
};

let TextArea: React.FC<Props> = function (props) {
  const { maxLength, value } = props;
  const remainingNumChars =
    maxLength != null && typeof value === 'string'
      ? maxLength - value.length
      : null;
  return (
    <div className="TextArea-container">
      <textarea
        {...props}
        onChange={(event) => props.onChange(event.target.value)}
      />
      {remainingNumChars != null && typeof value === 'string' && (
        <aside
          title={`You have used ${value.length.toLocaleString()} of ${maxLength?.toLocaleString()} allowed characters`}
          className={
            remainingNumChars === 0
              ? 'error'
              : remainingNumChars <= 10
              ? 'warn'
              : undefined
          }
        >
          {remainingNumChars.toLocaleString()}
        </aside>
      )}
    </div>
  );
};

export default wrappable(TextArea);
