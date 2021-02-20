import { useMemo } from 'react';

import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import {
  AnswerSpec,
  ParameterValues,
} from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { AnswerSpecResultType } from '@veupathdb/wdk-client/lib/Utils/WdkResult';

import { SelectedResult } from '../components/BlastWorkspaceResult';
import { Props as IndividualResultProps } from '../components/IndividualResult';

export type AnswerSpecResultTypeConfig =
  | { status: 'loading' }
  | { status: 'not-offered' }
  | { status: 'complete'; value: AnswerSpecResultType };

export function useIndividualResultProps(
  multiQueryParamValues: ParameterValues,
  jobId: string,
  selectedResult: SelectedResult,
  lastSelectedIndividualResult: number,
  wdkRecordType: string | null
): IndividualResultProps {
  const resultIndex =
    selectedResult.type === 'individual'
      ? selectedResult.resultIndex
      : lastSelectedIndividualResult;

  const baseAnswerSpec = useBaseAnswerSpec(
    multiQueryParamValues,
    wdkRecordType
  );

  const answerResultConfig = useMemo(
    (): AnswerSpecResultTypeConfig =>
      baseAnswerSpec == null
        ? { status: 'loading' }
        : !baseAnswerSpec.offered
        ? { status: 'not-offered' }
        : {
            status: 'complete',
            value: {
              type: 'answerSpec',
              answerSpec: baseAnswerSpec.value,
              displayName: 'BLAST',
            },
          },
    [baseAnswerSpec]
  );

  return useMemo(
    () =>
      answerResultConfig.status === 'loading'
        ? { status: 'loading' }
        : answerResultConfig.status === 'not-offered'
        ? { status: 'not-offered' }
        : {
            status: 'complete',
            answerResultConfig: answerResultConfig.value,
            viewId: `blast-workspace-result-individual__${jobId}__${resultIndex}`,
          },
    [answerResultConfig, jobId, resultIndex]
  );
}

type BaseAnswerSpec = { offered: false } | { offered: true; value: AnswerSpec };

function useBaseAnswerSpec(
  multiQueryParamValues: ParameterValues,
  wdkRecordType: string | null
) {
  return useWdkService(
    async (wdkService): Promise<BaseAnswerSpec> => {
      if (wdkRecordType == null) {
        return { offered: false };
      }

      const recordClass = await wdkService.findRecordClass(wdkRecordType);

      console.log(recordClass.searches);

      const question = recordClass.searches.find(({ urlSegment }) =>
        urlSegment.endsWith('MultiBlast')
      );

      if (question == null) {
        return { offered: false };
      }

      const { parameters } = await wdkService.getQuestionGivenParameters(
        question.urlSegment,
        multiQueryParamValues
      );

      const paramValues = parameters.reduce(
        (memo, { initialDisplayValue, name }) => {
          const paramValue =
            multiQueryParamValues[name] != null
              ? multiQueryParamValues[name]
              : initialDisplayValue;

          if (paramValue != null) {
            memo[name] = paramValue;
          }

          return memo;
        },
        {} as ParameterValues
      );

      return {
        offered: true,
        value: {
          searchName: question.urlSegment,
          searchConfig: {
            parameters: paramValues,
          },
        },
      };
    },
    [multiQueryParamValues]
  );
}
