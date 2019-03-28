/**
 * Provides a simple wrapper around <input type="text"/>.  The only difference
 * is that the value passed to the onChange property is the new value inside the
 * textbox, not the event causing the change.  This component can be easily
 * modified to render a password input by passing a type="password" property.
 */

import React from 'react';

import { Omit } from 'wdk-client/Core/CommonTypes';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;
type InputWithoutOnChangeAndValue = Omit<InputProps, ['onChange', 'value']>;
type Props = InputWithoutOnChangeAndValue & {
  value: string[];
  onChange: (value: string[]) => void;
};

const TextBoxMultivalued = function (originalProps: Props) {
  const { onChange, value, ...props } = originalProps;
  const changeHandler = function(event: React.ChangeEvent<HTMLInputElement>): void {
    onChange(event.target.value.split(/\s*,\s*/g));
  };
  const stringValue = value.join(', ');
  return ( <input type="text" {...props} onChange={changeHandler} value={stringValue}/> );
};

export default wrappable(TextBoxMultivalued);
