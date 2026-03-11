import React, { useMemo } from 'react';

import { EbrcDefaultQuestionForm } from '@veupathdb/web-common/lib/components/questions/EbrcDefaultQuestionForm';

import { Props } from '@veupathdb/wdk-client/lib/Views/Question/DefaultQuestionForm';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';

export function GenesByEdaSubset(props: Props) {
  const datasetId = props.state.paramValues['eda_dataset_id'];
  const recordclass = (datasetId.startsWith('DS_') == false) ? 'userdataset' : 'dataset';

  const datasetRecord = useWdkService(
    async (wdkService) => {
      if (datasetId == null) return;
      return wdkService.getRecord(recordclass, [
        { name: 'dataset_id', value: datasetId },
      ]);
    },
    [datasetId]
  );
  const xformProps = useMemo(() => {
    return {
      ...props,
      state: {
        ...props.state,
        question: {
          ...props.state.question,
          displayName:
            datasetRecord?.displayName ?? props.state.question.displayName,
        },
      },
    };
  }, [datasetRecord, props]);
  return <EbrcDefaultQuestionForm {...xformProps} />;
}
