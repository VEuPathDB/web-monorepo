/**
 * Provides a simple wrapper around <textarea/>.  The only difference
 * is that the value passed to the onChange property is the new value inside the
 * textbox, not the event causing the change.
 */

import { wrappable } from 'wdk-client/Utils/ComponentUtils';

let TextArea = function(props) {
  let onChange = function(event) {
    props.onChange(event.target.value);
  };
  return ( <textarea {...props} onChange={onChange}/> );
}

export default wrappable(TextArea);
