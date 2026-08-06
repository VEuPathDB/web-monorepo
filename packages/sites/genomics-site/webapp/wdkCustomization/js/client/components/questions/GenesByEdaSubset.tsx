import React, { useMemo } from 'react';

import { EbrcDefaultQuestionForm } from '@veupathdb/web-common/lib/components/questions/EbrcDefaultQuestionForm';

import { Props } from '@veupathdb/wdk-client/lib/Views/Question/DefaultQuestionForm';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';

export function GenesByEdaSubset(props: Props) {
  const datasetId = props.state.paramValues['eda_dataset_id'];
  const isUserDataset = datasetId?.startsWith('EDAUD_');
  const recordclass =
    datasetId?.startsWith('DS_') == false ? 'userdataset' : 'dataset';

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
    // For user datasets, hide the eda_dataset_id parameter
    const modifiedParameters = isUserDataset
      ? props.state.question.parameters.map((p) => {
          if (p.name === 'eda_dataset_id') {
            return { ...p, isVisible: false };
          }
          return p;
        })
      : props.state.question.parameters;

    // Also filter it from parameter groups
    const modifiedGroups = isUserDataset
      ? props.state.question.groups.map((g) => ({
          ...g,
          parameters: g.parameters.filter(
            (pName) => pName !== 'eda_dataset_id'
          ),
        }))
      : props.state.question.groups;

    const datasetNameHtml =
      isUserDataset && datasetRecord
        ? `<div style="font-size: 0.66em; margin: 0.5em 0 1em 0.5em;">${datasetRecord.displayName}</div>`
        : '';

    return {
      ...props,
      state: {
        ...props.state,
        question: {
          ...props.state.question,
          parameters: modifiedParameters,
          groups: modifiedGroups,
          displayName:
            datasetRecord?.recordClassName ===
            'UserDatasetRecordClasses.UserDatasetRecordClass'
              ? `${props.state.question.displayName}${datasetNameHtml}`
              : datasetRecord?.displayName ?? props.state.question.displayName,
        },
      },
    };
  }, [datasetRecord, props, isUserDataset]);

  return <EbrcDefaultQuestionForm {...xformProps} />;
}
