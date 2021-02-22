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
  combinedResult: MultiQueryReportJson,
  hitTypeDisplayName: string,
  hitTypeDisplayNamePlural: string
): IndividualResultProps {
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
    multiQueryParamValues[BLAST_QUERY_SEQUENCE_PARAM_NAME],
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
                    [BLAST_QUERY_SEQUENCE_PARAM_NAME]: querySequence,
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

    const querySubDescription = queryCount === 1 ? 'Your query' : 'This query';

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
