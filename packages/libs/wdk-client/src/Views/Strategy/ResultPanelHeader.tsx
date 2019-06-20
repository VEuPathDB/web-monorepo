import React from 'react';
import { RecordClass } from 'wdk-client/Utils/WdkModel';
import { Step } from 'wdk-client/Utils/WdkUser';

interface Props {
  step: Step;
  recordClass: RecordClass;
}

export default function ResultPanelHeader({ step, recordClass }: Props) {
  return (
    <h2 style={{ marginTop: '.75em', fontWeight: 'bold' }}>
      {step.estimatedSize == null ? '?' : step.estimatedSize.toLocaleString()} {step.estimatedSize === 1 ? recordClass.displayName : recordClass.displayNamePlural}
    </h2>
  )
}
