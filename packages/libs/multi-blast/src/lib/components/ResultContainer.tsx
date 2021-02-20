import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { ParameterValues } from '@veupathdb/wdk-client/lib/Utils/WdkModel';

import { useCombinedResultProps } from '../hooks/combinedResults';
import { useIndividualResultProps } from '../hooks/individualResult';
import { MultiQueryReportJson } from '../utils/ServiceTypes';

import { SelectedResult } from './BlastWorkspaceResult';
import { CombinedResult } from './CombinedResult';
import { IndividualResult } from './IndividualResult';

interface Props {
  combinedResult: MultiQueryReportJson;
  filesToOrganisms: Record<string, string>;
  hitTypeDisplayName: string;
  hitTypeDisplayNamePlural: string;
  jobId: string;
  lastSelectedIndividualResult: number;
  multiQueryParamValues: ParameterValues;
  selectedResult: SelectedResult;
  wdkRecordType: string | null;
}

export function ResultContainer({
  combinedResult,
  filesToOrganisms,
  hitTypeDisplayName,
  hitTypeDisplayNamePlural,
  jobId,
  lastSelectedIndividualResult,
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

  const individualResultProps = useIndividualResultProps(
    multiQueryParamValues,
    jobId,
    selectedResult,
    lastSelectedIndividualResult
  );

  return (
    <div className="ResultContainer">
      {selectedResult.type === 'combined' ? (
        <CombinedResult {...combinedResultProps} />
      ) : (
        <IndividualResult {...individualResultProps} />
      )}
    </div>
  );
}
