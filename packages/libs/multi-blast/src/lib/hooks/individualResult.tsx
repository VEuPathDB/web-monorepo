import { useCallback, useContext, useMemo } from 'react';
import { useHistory } from 'react-router';
import { ActionMeta, ValueType } from 'react-select';

import { WdkDepdendenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { DEFAULT_STRATEGY_NAME } from '@veupathdb/wdk-client/lib/StoreModules/QuestionStoreModule';
import {
  AnswerSpec,
  ParameterValues,
} from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { AnswerSpecResultType } from '@veupathdb/wdk-client/lib/Utils/WdkResult';
import {
  NewStepSpec,
  NewStrategySpec,
} from '@veupathdb/wdk-client/lib/Utils/WdkUser';

import {
  Props as IndividualResultProps,
  IndividualQueryOption,
} from '../components/IndividualResult';
import { Props as ResultContainerProps } from '../components/ResultContainer';
import { IndividualQuery } from '../utils/CommonTypes';
import { BLAST_QUERY_SEQUENCE_PARAM_NAME } from '../utils/params';

export type AnswerSpecResultTypeConfig =
  | { status: 'loading' }
  | { status: 'not-offered' }
  | { status: 'complete'; value: AnswerSpecResultType };

export function useIndividualResultProps({
  multiQueryParamValues,
  individualQueries,
  jobId,
  selectedResult,
  lastSelectedIndividualResult,
  wdkRecordType,
  combinedResult,
  hitTypeDisplayName,
  hitTypeDisplayNamePlural,
}: ResultContainerProps): IndividualResultProps {
  const history = useHistory();
  const wdkDependencies = useContext(WdkDepdendenciesContext);
  const wdkService = wdkDependencies?.wdkService;

  const resultIndex =
    selectedResult.type === 'individual'
      ? selectedResult.resultIndex
      : lastSelectedIndividualResult;

  const baseAnswerSpec = useBaseAnswerSpec(
    multiQueryParamValues,
    wdkRecordType
  );

  const querySequence = useIndividualQuerySequence(
    individualQueries,
    resultIndex
  );

  const individualQueryOptions = useMemo(() => {
    const resultsByQuery = combinedResult.BlastOutput2;

    return resultsByQuery.map((queryResult, i) => {
      const queryTitle = queryResult.report.results.search.query_title;

      const label =
        queryTitle == null ? `${i + 1}: Untitled` : `${i + 1}: >${queryTitle}`;

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
                    [BLAST_QUERY_SEQUENCE_PARAM_NAME]: querySequence.query,
                  },
                },
              },
              displayName: 'BLAST',
            },
          },
    [baseAnswerSpec, querySequence]
  );

  const hitCountDescription = useMemo(() => {
    const resultsByQuery = combinedResult.BlastOutput2;

    const queryCount = resultsByQuery.length;

    const individualResultReport = resultsByQuery[resultIndex - 1].report;
    const hitCount = individualResultReport.results.search.hits.length;

    const querySubDescription =
      queryCount === 1 ? 'Your query sequence' : 'This query sequence';

    const hitSubDescription = `${hitCount} ${
      hitCount === 1 ? hitTypeDisplayName : hitTypeDisplayNamePlural
    }`;

    return `${querySubDescription} hit ${hitSubDescription}`;
  }, [
    combinedResult,
    hitTypeDisplayName,
    hitTypeDisplayNamePlural,
    resultIndex,
  ]);

  const linkOutProps = useMemo(() => {
    if (wdkService == null) {
      throw new Error(
        'To export to a strategy, WdkDependendenciesContext must be configured.'
      );
    }

    if (answerResultConfig.status === 'loading') {
      return {
        linkOutTooltipContent: 'Loading.',
      };
    }

    if (answerResultConfig.status === 'not-offered') {
      return {
        linkOutTooltipContent: `This feature is not available for ${hitTypeDisplayNamePlural}.`,
      };
    }

    const onLinkOutClick = async () => {
      const answerSpec = answerResultConfig.value.answerSpec;
      const customName = answerResultConfig.value.displayName;

      const stepSpec: NewStepSpec = {
        ...answerSpec,
        customName,
      };
      const stepResp = await wdkService.createStep(stepSpec);
      const strategySpec: NewStrategySpec = {
        stepTree: { stepId: stepResp.id },
        name: DEFAULT_STRATEGY_NAME,
        isSaved: false,
        isPublic: false,
      };
      const strategyResp = await wdkService.createStrategy(strategySpec);
      history.push(`/workspace/strategies/${strategyResp.id}`);
    };

    return {
      linkOutTooltipContent:
        'Download or data mine using the search strategy system.',
      onLinkOutClick,
    };
  }, [answerResultConfig, history, hitTypeDisplayNamePlural, wdkService]);

  return useMemo(
    () =>
      answerResultConfig.status === 'loading'
        ? { status: 'loading' }
        : answerResultConfig.status === 'not-offered'
        ? { status: 'not-offered' }
        : {
            status: 'complete',
            answerResultConfig: answerResultConfig.value,
            hitCountDescription,
            individualQueryOptions,
            onSelectedOptionChange,
            selectedQueryOption: individualQueryOptions[resultIndex - 1],
            individualJobId: querySequence.jobId,
            viewId: `blast-workspace-result-individual__${jobId}__${resultIndex}`,
            ...linkOutProps,
          },
    [
      answerResultConfig,
      hitCountDescription,
      individualQueryOptions,
      jobId,
      linkOutProps,
      onSelectedOptionChange,
      resultIndex,
      querySequence,
    ]
  );
}

type BaseAnswerSpec = { offered: false } | { offered: true; value: AnswerSpec };

function useBaseAnswerSpec(
  multiQueryParamValues: ParameterValues,
  wdkRecordType: string
) {
  return useWdkService(
    async (wdkService): Promise<BaseAnswerSpec> => {
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

function useIndividualQuerySequence(
  individualQueries: IndividualQuery[],
  resultIndex: number
) {
  return useMemo(() => individualQueries[resultIndex - 1], [
    individualQueries,
    resultIndex,
  ]);
}
