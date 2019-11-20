/**
 * Provides a simple wrapper around <input type="checkbox"/>.  Rather than using
 * the 'checked' property however, this component takes a 'value' property which
 * must be a boolean.  If true, the box is checked, else it is not.  The
 * onChange function passed to this component is passed the new value of the
 * checkbox (typically !previousValue), rather than a click event.
 */

import React from 'react';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';

type Props = {
  value: boolean;
  onChange: (newValue: boolean) => void;
  isDisabled?: boolean;
}
const Checkbox = (props: Props) => {
  let { onChange, value } = props;
  let changeHandler = (_event: React.FormEvent<HTMLInputElement>) => { onChange(!value); };
  let isDisabled = props.isDisabled || false;

  return <input type="checkbox" checked={value} onChange={changeHandler} disabled={isDisabled}/>;
}

export default wrappable(Checkbox);
