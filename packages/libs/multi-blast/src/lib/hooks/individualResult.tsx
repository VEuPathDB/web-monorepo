import { useMemo } from 'react';

import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { ParameterValues } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { AnswerSpecResultType } from '@veupathdb/wdk-client/lib/Utils/WdkResult';

import { SelectedResult } from '../components/BlastWorkspaceResult';
import { Props as IndividualResultProps } from '../components/IndividualResult';

export function useIndividualResultProps(
  multiQueryParamValues: ParameterValues,
  jobId: string,
  selectedResult: SelectedResult
): IndividualResultProps {
  const selectedResultIndex =
    selectedResult.type === 'individual' ? selectedResult.resultIndex : 1;

  const baseAnswerResultConfig = useBaseAnswerResultConfig(
    multiQueryParamValues
  );

  return useMemo(
    () =>
      baseAnswerResultConfig == null
        ? { loading: true }
        : {
            loading: false,
            answerResultConfig: baseAnswerResultConfig,
            viewId: `blast-workspace-result-individual__${jobId}__${selectedResultIndex}`,
          },
    [baseAnswerResultConfig]
  );
}

function useBaseAnswerResultConfig(multiQueryParamValues: ParameterValues) {
  return useWdkService(
    async (wdkService): Promise<AnswerSpecResultType> => {
      const { parameters } = await wdkService.getQuestionGivenParameters(
        'GenesByMultiBlast',
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

      const answerSpec = {
        searchName: 'GenesByMultiBlast',
        searchConfig: {
          parameters: paramValues,
        },
      };

      return {
        type: 'answerSpec',
        answerSpec,
        displayName: 'BLAST',
      };
    },
    [multiQueryParamValues]
  );
}
