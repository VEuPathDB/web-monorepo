import React from 'react';
import { StepDetailProps } from 'wdk-client/Views/Strategy/Types';

export default function NestedStepDetails({ stepTree: { step, recordClass }}: StepDetailProps) {
  return (
    <React.Fragment>
      <div>
        The nested strategy gets opened below
      </div>
      <hr />
      <div className="StepBoxes--StepDetailsResults">
        <strong>Results:</strong> {step.estimatedSize ? step.estimatedSize.toLocaleString() : '?'} {step.estimatedSize === 1 ? recordClass.displayName : recordClass.displayNamePlural}
      </div>
    </React.Fragment>
  )
}