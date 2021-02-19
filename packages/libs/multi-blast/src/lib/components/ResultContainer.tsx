import { useCombinedResultProps } from '../hooks/combinedResults';
import { MultiQueryReportJson } from '../utils/ServiceTypes';

import { UnderConstruction } from './BlastWorkspace';
import { SelectedResult } from './BlastWorkspaceResult';
import { CombinedResult } from './CombinedResult';

interface Props {
  combinedResult: MultiQueryReportJson;
  filesToOrganisms: Record<string, string>;
  hitTypeDisplayName: string;
  hitTypeDisplayNamePlural: string;
  selectedResult: SelectedResult;
  wdkRecordType: string | null;
}

export function ResultContainer({
  combinedResult,
  filesToOrganisms,
  hitTypeDisplayName,
  hitTypeDisplayNamePlural,
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

  return (
    <div className="ResultContainer">
      {selectedResult.type === 'combined' ? (
        <CombinedResult {...combinedResultProps} />
      ) : (
        <UnderConstruction />
      )}
    </div>
  );
}
