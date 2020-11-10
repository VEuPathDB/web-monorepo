import React from 'react';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';

// by default, no supplemental submit buttons
let TabularReporterFormSubmitButtons = props =>
  <button className="btn" type="submit" onClick={props.onSubmit}>Get {props.recordClass.displayNamePlural}</button>;

export default wrappable(TabularReporterFormSubmitButtons);
