import React from 'react';
import { wrappable } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { RecordClass } from '@veupathdb/wdk-client/lib/Utils/WdkModel';

interface TabularReporterFormSubmitButtonsProps {
  onSubmit: (event: React.MouseEvent<HTMLButtonElement>) => void;
  recordClass: RecordClass;
}

// by default, no supplemental submit buttons
const TabularReporterFormSubmitButtons: React.FC<TabularReporterFormSubmitButtonsProps> =
  (props) => (
    <button className="btn" type="submit" onClick={props.onSubmit}>
      Get {props.recordClass.displayNamePlural}
    </button>
  );

export default wrappable(TabularReporterFormSubmitButtons);
