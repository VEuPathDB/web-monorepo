/**
 * Provides a simple wrapper around <input type="file"/>.  The only difference
 * is that the value passed to the onChange property is the new file inside the
 * field, not the event causing the change.
 */

import React from 'react';

import { Omit } from 'wdk-client/Core/CommonTypes';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;
type InputWithoutOnChange = Omit<InputProps, 'onChange'>;
type Props = InputWithoutOnChange & {
  onChange: (value: File | null) => void;
};

const FileInput = function (originalProps: Props) {
  const { onChange, ...props } = originalProps;
  const changeHandler = function(event: React.ChangeEvent<HTMLInputElement>): void {
    onChange(event.target.files && event.target.files[0]);
  };
  return ( <input type="file" {...props} onChange={changeHandler}/> );
}

export default wrappable(FileInput);
