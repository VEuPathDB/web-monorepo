/**
 * Provides a simple wrapper around <textarea/>.  The only difference
 * is that the value passed to the onChange property is the new value inside the
 * textbox, not the event causing the change.
 */

import React, { TextareaHTMLAttributes } from 'react';

import { Omit } from '../../Core/CommonTypes';
import { wrappable } from '../../Utils/ComponentUtils';

type InputProps = TextareaHTMLAttributes<HTMLTextAreaElement>;
type InputPropsWithoutOnChange = Omit<InputProps, 'onChange'>;
type Props = InputPropsWithoutOnChange & {
  onChange: (value: string) => void;
};

let TextArea: React.SFC<Props> = function (props) {
  return (
    <textarea
      {...props}
      onChange={(event) => props.onChange(event.target.value)}
    />
  );
};

export default wrappable(TextArea);
