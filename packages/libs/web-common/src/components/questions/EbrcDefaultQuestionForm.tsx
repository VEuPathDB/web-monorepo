import React from 'react';

import DefaultQuestionForm, {
  Props,
} from '@veupathdb/wdk-client/lib/Views/Question/DefaultQuestionForm';

import { useEbrcDescription } from '../../components/questions/EbrcDescription';
import { useUDEbrcDescription } from '../../components/questions/UDEbrcDescription';

export function EbrcDefaultQuestionForm(props: Props) {
  const { DescriptionComponent, DatasetsComponent, shouldLoadDatasetRecords } =
    (props.state.question.queryName?.includes('UserDataset')
      ? useUDEbrcDescription(props.state.question)
      : useEbrcDescription(props.state.question)
    );
  return (
    <DefaultQuestionForm
      {...props}
      DescriptionComponent={DescriptionComponent}
      DatasetsComponent={
        shouldLoadDatasetRecords ? DatasetsComponent : undefined
      }
    />
  );
}
