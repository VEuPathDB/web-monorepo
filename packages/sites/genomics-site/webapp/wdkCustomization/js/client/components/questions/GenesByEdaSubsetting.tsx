import React, { useMemo } from 'react';

import { EbrcDefaultQuestionForm } from '@veupathdb/web-common/lib/components/questions/EbrcDefaultQuestionForm';

import { Props } from '@veupathdb/wdk-client/lib/Views/Question/DefaultQuestionForm';
import { useLocation } from 'react-router-dom';

export function GenesByEdaSubsetting(props: Props) {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const datasetId = params.get('datasetId');
  const xformProps = useMemo(() => {
    return {
      ...props,
      state: {
        ...props.state,
        question: {
          ...props.state.question,
          displayName: `${props.state.question.displayName}: ${datasetId}`,
        },
      },
    };
  }, [datasetId, props]);
  return (
    <>
      <pre>{JSON.stringify({ datasetId })}</pre>
      <EbrcDefaultQuestionForm {...xformProps} />
    </>
  );
}
