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
  return (
    <div className="ResultContainer">
      {selectedResult.type === 'combined' ? (
        <CombinedResult
          combinedResult={combinedResult}
          filesToOrganisms={filesToOrganisms}
          hitTypeDisplayName={hitTypeDisplayName}
          hitTypeDisplayNamePlural={hitTypeDisplayNamePlural}
          wdkRecordType={wdkRecordType}
        />
      ) : (
        <UnderConstruction />
      )}
    </div>
  );
}
