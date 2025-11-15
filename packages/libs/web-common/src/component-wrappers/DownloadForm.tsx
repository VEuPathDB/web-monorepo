import * as React from 'react';
import { selectReporterComponent } from '../util/reporter';
import { RecordClass } from '@veupathdb/wdk-client/lib/Utils/WdkModel';

interface DownloadFormProps {
  selectedReporter: string;
  recordClass: RecordClass;
  [key: string]: any;
}

export function DownloadForm() {
  return function EupathDownloadForm(props: DownloadFormProps) {
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
