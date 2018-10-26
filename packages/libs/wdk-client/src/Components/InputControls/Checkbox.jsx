/**
 * Provides a simple wrapper around <input type="checkbox"/>.  Rather than using
 * the 'checked' property however, this component takes a 'value' property which
 * must be a boolean.  If true, the box is checked, else it is not.  The
 * onChange function passed to this component is passed the new value of the
 * checkbox (typically !previousValue), rather than a click event.
 */

import { wrappable } from 'wdk-client/Utils/ComponentUtils';

const Checkbox = (props) => {
  let { onChange, value } = props;
  let changeHandler = (event) => { onChange(!value); };

  return <input type="checkbox" {...props} checked={value} onChange={changeHandler} />;
}

export default wrappable(Checkbox);
