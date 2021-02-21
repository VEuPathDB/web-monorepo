import { useCallback, useMemo } from 'react';

import { useHistory } from 'react-router';
import { ActionMeta, ValueType } from 'react-select';

import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import {
  AnswerSpec,
  ParameterValues,
} from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { AnswerSpecResultType } from '@veupathdb/wdk-client/lib/Utils/WdkResult';

import { SelectedResult } from '../components/BlastWorkspaceResult';
import {
  Props as IndividualResultProps,
  IndividualQueryOption,
} from '../components/IndividualResult';
import { MultiQueryReportJson } from '../utils/ServiceTypes';
import { BLAST_QUERY_SEQUENCE_PARAM_NAME } from '../utils/params';

// Coarse regex which matches a single defline-free sequence,
// or one or more deflined sequences. The production version
// of our client will retrieve individual sequences from the
// multi-blast service
const INDIVIDUAL_SEQUENCE_REGEX = /^[^>\s]+$|>.+(\n[^>\s]+)+/g;

export type AnswerSpecResultTypeConfig =
  | { status: 'loading' }
  | { status: 'not-offered' }
  | { status: 'complete'; value: AnswerSpecResultType };

export function useIndividualResultProps(
  multiQueryParamValues: ParameterValues,
  jobId: string,
  selectedResult: SelectedResult,
  lastSelectedIndividualResult: number,
  wdkRecordType: string | null,
  combinedResult: MultiQueryReportJson
): IndividualResultProps {
  const history = useHistory();

  const resultIndex =
    selectedResult.type === 'individual'
      ? selectedResult.resultIndex
      : lastSelectedIndividualResult;

  const baseAnswerSpec = useBaseAnswerSpec(
    multiQueryParamValues,
    wdkRecordType
  );

  const querySequence = useIndividualQuerySequence(
    multiQueryParamValues[BLAST_QUERY_SEQUENCE_PARAM_NAME],
    resultIndex
  );

  const individualQueryOptions = useMemo(() => {
    const resultsByQuery = combinedResult.BlastOutput2;

    return resultsByQuery.map((queryResult, i) => {
      const queryTitle = queryResult.report.results.search.query_title;

      const label =
        queryTitle == null ? `${i + 1}: Untitled` : `${i + 1}: ${queryTitle}`;

      return {
        value: i + 1,
        label,
      };
    });
  }, [combinedResult]);

  const onSelectedOptionChange = useCallback(
    (
      selection: ValueType<IndividualQueryOption, false>,
      actionMeta: ActionMeta<IndividualQueryOption>
    ) => {
      if (actionMeta.action === 'select-option' && selection != null) {
        history.push(
          `/workspace/blast/result/${jobId}/individual/${selection.value}`
        );
      }
    },
    [history, jobId]
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
              answerSpec: {
                ...baseAnswerSpec.value,
                searchConfig: {
                  ...baseAnswerSpec.value.searchConfig,
                  parameters: {
                    ...baseAnswerSpec.value.searchConfig.parameters,
                    [BLAST_QUERY_SEQUENCE_PARAM_NAME]: querySequence,
                  },
                },
              },
              displayName: 'BLAST',
            },
          },
    [baseAnswerSpec, querySequence]
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
            individualQueryOptions,
            onSelectedOptionChange,
            selectedQueryOption: individualQueryOptions[resultIndex - 1],
            viewId: `blast-workspace-result-individual__${jobId}__${resultIndex}`,
          },
    [
      answerResultConfig,
      individualQueryOptions,
      jobId,
      onSelectedOptionChange,
      resultIndex,
    ]
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

function useIndividualQuerySequence(multiQuery: string, resultIndex: number) {
  const individualSequences = useMemo(
    () => multiQuery.trim().match(INDIVIDUAL_SEQUENCE_REGEX) ?? [],
    [multiQuery]
  );

  return individualSequences[resultIndex - 1] ?? multiQuery;
}
