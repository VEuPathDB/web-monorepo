import { ResultPanelController } from '@veupathdb/wdk-client/lib/Controllers';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { ParameterValues } from '@veupathdb/wdk-client/lib/Utils/WdkModel';

import { useCombinedResultProps } from '../hooks/combinedResults';
import { MultiQueryReportJson } from '../utils/ServiceTypes';

import { SelectedResult } from './BlastWorkspaceResult';
import { CombinedResult } from './CombinedResult';

interface Props {
  combinedResult: MultiQueryReportJson;
  filesToOrganisms: Record<string, string>;
  hitTypeDisplayName: string;
  hitTypeDisplayNamePlural: string;
  multiQueryParamValues: ParameterValues;
  selectedResult: SelectedResult;
  wdkRecordType: string | null;
}

export function ResultContainer({
  combinedResult,
  filesToOrganisms,
  hitTypeDisplayName,
  hitTypeDisplayNamePlural,
  multiQueryParamValues,
  selectedResult,
  wdkRecordType,
}: Props) {
  const combinedResultProps = useCombinedResultProps(
    combinedResult,
    filesToOrganisms,
    hitTypeDisplayName,
    hitTypeDisplayNamePlural,
    wdkRecordType
  );

  const baseIndividualResultType = useWdkService(
    async (wdkService) => {
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
      } as const;
    },
    [multiQueryParamValues]
  );

  return (
    <div className="ResultContainer">
      {baseIndividualResultType == null ? null : selectedResult.type ===
        'combined' ? (
        <CombinedResult {...combinedResultProps} />
      ) : (
        <ResultPanelController
          resultType={baseIndividualResultType}
          viewId={`blast-workspace-result-individual__${selectedResult.resultIndex}`}
        />
      )}
    </div>
  );
}
