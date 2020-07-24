import React from 'react';

import { Plugin } from 'wdk-client/Utils/ClientPlugin';
import { StepDetailProps, UiStepTree } from 'wdk-client/Views/Strategy/Types';

export type NestedStepDetailsProps = StepDetailProps<UiStepTree>;

export default function NestedStepDetails(props: NestedStepDetailsProps) {
  return (
    <Plugin
      context={{
        type: 'stepDetails',
        name: 'nested',
        searchName: props.stepTree.step.searchName,
        recordClassName: props.stepTree.step.recordClassName
      }}
      pluginProps={props}
      defaultComponent={DefaultNestedStepDetails}
    />
  );
}

export function DefaultNestedStepDetails(props: NestedStepDetailsProps) {
  return (
    <div>
      The nested strategy gets opened below
    </div>
  );
}
