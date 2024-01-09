import * as React from 'react';
import { selectReporterComponent } from '../util/reporter';

export function DownloadForm() {
  return function EupathDownloadForm(props) {
    let Reporter = selectReporterComponent(
      props.selectedReporter,
      props.recordClass.fullName
    );
    return (
      <div>
        <Reporter {...props} />
      </div>
    );
  };
}
